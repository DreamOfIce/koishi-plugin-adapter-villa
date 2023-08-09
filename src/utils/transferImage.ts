import { webcrypto } from "crypto";
import { readFile } from "fs/promises";
import { extname } from "path";
import { fromBuffer } from "file-type";
import type { ParameterizedContext } from "koa";
import { base64ToArrayBuffer, sleep } from "koishi";

import type { VillaBot } from "../bot";
import { API } from "../structs";
import { logger } from "./logger";

interface Image {
  data: Uint8Array;
  mime: string;
}

const images: Map<string, Image> = new Map();

const addImage = async (
  image: Uint8Array,
  typeInfo: { ext?: string | undefined; mime?: string | undefined } = {},
) => {
  const { ext = "", mime = "application/octet-stream" } = {
    ...((await fromBuffer(image)) ?? {}),
    ...typeInfo,
  };
  const hash = Array.from(
    new Uint8Array(await webcrypto.subtle.digest("SHA-256", image)),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  images.set(hash, { data: image, mime });
  return {
    hash,
    url: `${hash}${ext.length > 0 && ext.startsWith(".") ? ext : `.${ext}`}`,
  };
};

export async function transferImage(
  this: VillaBot,
  imgUrl: string,
  villaId: string,
): Promise<string> {
  if (!this.ctx.root.config.selfUrl) {
    logger.warn("selfUrl is required for image transfer");
    return imgUrl;
  }
  const { hostname, protocol } = new URL(imgUrl);
  let hash: string | undefined, url: string | undefined;

  switch (protocol) {
    case "http:":
    case "https:": {
      if (hostname.endsWith("mihoyo.com") || hostname.endsWith("miyoushe.com"))
        return imgUrl;
      else {
        url = imgUrl;
        break;
      }
    }
    case "file:": {
      const image = await readFile(imgUrl);
      const ext: string = extname(imgUrl);
      ({ hash, url } = await addImage(image, { ext }));
      break;
    }
    // data:[<mediatype>][;base64],<data>
    case "data:": {
      const [type, data] = imgUrl.slice(5).split(",") as [string, string];
      const [mime, encode] = type.split(";");
      if (encode !== "base64") {
        logger.warn(`Unsupported dataURL encode: ${encode}`);
        return imgUrl;
      }
      const image = base64ToArrayBuffer(data);
      ({ hash, url } = await addImage(image, { mime }));
      break;
    }
    // TODO: remove legacy support for protocol base64:
    case "base64:": {
      const image = base64ToArrayBuffer(imgUrl.slice(9));
      ({ hash, url } = await addImage(image));
      break;
    }
    default: {
      logger.warn(`Unsupported image protocol: ${protocol}`);
      return imgUrl;
    }
  }

  this.ctx.router.get(
    `${this.config.path}/:hash(\\w+)(.:ext)?`,
    (
      ctx: ParameterizedContext<
        Record<never, never>,
        { params: { hash: string } }
      >,
    ) => {
      const { hash } = ctx.params;
      if (images.has(hash)) {
        const { data, mime } = images.get(hash)!;
        ctx.status = 200;
        ctx.type = mime;
        ctx.body = Buffer?.isBuffer(data) ? data : Buffer?.from(data);
      } else {
        ctx.status = 404;
      }
    },
  );

  try {
    for (let i = 0; i < this.config.transfer.maxRetries; i++) {
      const { data, status } =
        await this.axios.axios<API.TransferImage.Response>(
          "/vila/api/bot/platform/transferImage",
          {
            method: "POST",
            data: <API.TransferImage.Request>{
              url: new URL(
                url,
                `${this.ctx.root.config.selfUrl}${this.config.path}/`,
              ).href,
            },
            headers: {
              "x-rpc-bot_villa_id": villaId,
            },
            validateStatus: (status) =>
              (status >= 200 && status < 300) || status === 429,
          },
        );
      if (status === 429) {
        if (this.config.transfer.maxRetries !== i) {
          logger.warn(
            `Image transfer API returned 429, try again after 5s(${
              this.config.transfer.maxRetries - i
            } retries left)`,
          );
          await sleep(5000);
          continue;
        } else {
          throw new Error("all retries failed!");
        }
      } else if (data.retcode !== 0) {
        throw new Error(`${data.message}(${data.retcode})`);
      } else {
        return data.data.new_url;
      }
    }
    return imgUrl;
  } catch (err) {
    if (err instanceof Error)
      logger.error(`Failed to transfer image ${imgUrl}: ${err.message}`);
    return imgUrl;
  } finally {
    if (hash) images.delete(hash);
  }
}
