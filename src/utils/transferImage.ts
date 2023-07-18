import { webcrypto } from "crypto";
import { readFile } from "fs/promises";
import { extname } from "path";
import { fileTypeFromBuffer } from "file-type";
import type { ParameterizedContext } from "koa";
import { base64ToArrayBuffer, sleep } from "koishi";
import { defineStruct } from "./defineStruct";
import type { VillaBot } from "../bot";
import { API } from "../structs";
import { logger } from "./logger";

const images: Record<string, ArrayBuffer> = {};

export async function transferImage(
  this: VillaBot,
  url: string
): Promise<string> {
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
      hash = Array.from(
        new Uint8Array(await webcrypto.subtle.digest("SHA-256", image))
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      images[hash] = image;
      sourceUrl = `${this.ctx.root.config.selfUrl!}${
        this.config.path
      }/${hash}${ext}`;
      break;
    }
    case "base64:": {
      const image = base64ToArrayBuffer(url.slice(9));
      let { ext }: { ext?: string } = (await fileTypeFromBuffer(image)) ?? {};
      ext = ext ? `.${ext}` : "";
      hash = Array.from(
        new Uint8Array(await webcrypto.subtle.digest("SHA-256", image))
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      images[hash] = image;
      sourceUrl = `${this.ctx.root.config.selfUrl!}${
        this.config.path
      }/${hash}${ext}`;
      break;
    }
    default: {
      logger.warn(`Unsupported image protocol: ${protocol}.`);
      return url;
    }
  }

  this.ctx.router.get(
    `${this.config.path}/:hash(\\w+).:ext`,
    (
      ctx: ParameterizedContext<
        Record<never, never>,
        { params: { hash: string } }
      >
    ) => {
      const { hash } = ctx.params;
      if (hash in images) {
        ctx.status = 200;
        ctx.body = images[hash];
      } else {
        ctx.status = 404;
      }
    }
  );

  try {
    for (let i = 0; i < this.config.transfer.maxRetries; i++) {
      const { data, status } =
        await this.axios.axios<API.TransferImage.Response>(
          "/vila/api/bot/platform/transferImage",
          {
            data: defineStruct<API.TransferImage.Request>({
              url: sourceUrl,
            }),
            validateStatus: (status) =>
              (status >= 200 && status < 300) || status === 429,
          }
        );
      if (status === 429) {
        if (this.config.transfer.maxRetries !== i) {
          logger.warn(
            `Image transfer API returned 429, try again after 5s(${
              this.config.transfer.maxRetries - i
            } retries left)`
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
    if (hash) delete images[hash];
  }
}
