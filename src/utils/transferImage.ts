import { webcrypto } from "crypto";
import { readFile } from "fs/promises";
import { extname } from "path";
import { fromBuffer } from "file-type";
import type { ParameterizedContext } from "koa";
import { base64ToArrayBuffer, sleep } from "koishi";

import type { VillaBot } from "../bot";
import { API } from "../structs";
import { logger } from "./logger";

const imagesMap: Map<string, ArrayBuffer> = new Map();
let routerInitialized = false;

export async function transferImage(
  this: VillaBot,
  url: string,
  villaId: string,
): Promise<string> {
  if (!routerInitialized) {
    routerInitialized = true;
    this.ctx.router.get(
      `${this.config.path}/:hash(\\w+).:ext([a-zA-Z]+)`,
      (
        ctx: ParameterizedContext<
          Record<never, never>,
          { params: { hash: string; ext: string } }
        >,
      ) => {
        const { hash, ext } = ctx.params;
        if (imagesMap.has(hash)) {
          ctx.res.statusCode = 200;
          ctx.res.setHeader("Content-Type", `image/${ext}`);
          // @FIXME: I directly use `ctx.res.end` here to
          // avoid some strange behavior that causes content-type to always be `application/json`
          ctx.res.end(imagesMap.get(hash));
        } else {
          ctx.status = 404;
        }
      },
    );
  }

  const { hostname, protocol } = new URL(url);
  let hash: string | undefined, sourceUrl: string;

  switch (protocol) {
    case "http:":
    case "https:": {
      if (hostname.endsWith("mihoyo.com") || hostname.endsWith("miyoushe.com"))
        return url;
      else {
        sourceUrl = url;
        break;
      }
    }
    case "file:": {
      const image = await readFile(url);
      const ext: string = extname(url);
      return transferImage.call(
        this,
        `data:image/${ext.slice(1)};base64,${image.toString("base64")}`,
        villaId,
      );
    }
    // legacy support for `base64://`
    case "base64:": {
      const base64 = hostname.replace(/^\/\//, "");
      const image = base64ToArrayBuffer(base64);
      let { ext }: { ext?: string } = (await fromBuffer(image)) ?? {};
      return transferImage.call(
        this,
        `data:image/${ext};base64,${url.slice(9)}`,
        villaId,
      );
    }
    case "data:": {
      const [contentType, data] = url.slice(5).split(";");
      if (!contentType?.startsWith("image/")) {
        logger.warn(`Unsupported image type: ${contentType}.`);
        return url;
      }
      if (!data?.startsWith("base64,")) {
        logger.warn("Unsupported image data format.");
        return url;
      }
      const base64 = data.slice(7);
      const image = base64ToArrayBuffer(base64);
      const ext = contentType.slice(6);
      hash = Array.from(
        new Uint8Array(await webcrypto.subtle.digest("SHA-256", image)),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      imagesMap.set(hash, image);
      sourceUrl = `${this.ctx.root.config.selfUrl!}${
        this.config.path
      }/${hash}.${ext}`;
      break;
    }
    default: {
      logger.warn(`Unsupported image protocol: ${protocol}.`);
      return url;
    }
  }

  try {
    for (let i = 0; i < this.config.transfer.maxRetries; i++) {
      const { data, status } =
        await this.axios.axios<API.TransferImage.Response>(
          "/vila/api/bot/platform/transferImage",
          {
            method: "POST",
            data: <API.TransferImage.Request>{
              url: sourceUrl,
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
    return url;
  } catch (err) {
    if (err instanceof Error)
      logger.error(`Failed to transfer image ${url}: ${err.message}`);
    return url;
  } finally {
    if (hash) imagesMap.delete(hash);
  }
}
