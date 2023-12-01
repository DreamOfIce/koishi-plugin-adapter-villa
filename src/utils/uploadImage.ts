import { readFile } from "fs/promises";
import { extname } from "path";
import { fromBuffer } from "file-type";
import { md5 } from "js-md5";
import { base64ToArrayBuffer } from "@satorijs/satori";
import { API } from "../structs";
import { VillaBot } from "../bot";
import { exclude } from "./misc";
import { logger } from "./logger";

const supportedExt = ["jpg", "jpeg", "png", "gif", "bmp"];
const defaultExt = "png";

export async function uploadImage(
  this: VillaBot,
  imgUrl: string,
  villaId: string,
): Promise<string> {
  const { protocol, pathname } = new URL(imgUrl);
  let image: ArrayBuffer, ext: string;
  switch (protocol) {
    case "http:":
    case "https:": {
      image = await this.ctx.http.get<ArrayBuffer>(imgUrl, {
        responseType: "arraybuffer",
      });
      ext = extname(pathname);
      break;
    }

    case "file:": {
      image = await readFile(imgUrl);
      ext = extname(imgUrl).slice(1);
      break;
    }

    case "data:": {
      const [type, data] = imgUrl.slice(5).split(",") as [string, string];
      const [mime, encode] = type.split(";");
      if (encode !== "base64") {
        logger.warn(`Unsupported dataURL encode: ${encode}`);
        return imgUrl;
      }
      image = base64ToArrayBuffer(data);
      ext =
        (await fromBuffer(image))?.ext ??
        /^\w+\/([\w-])/.exec(mime ?? "")?.[0] ??
        "";
      break;
    }

    // TODO: remove legacy support for protocol base64:
    case "base64:": {
      image = base64ToArrayBuffer(imgUrl.slice(9));
      ext = (await fromBuffer(image))?.ext ?? "";
      break;
    }

    default: {
      logger.error(`Unsupported image protocol: ${protocol}`);
      return imgUrl;
    }
  }
  if (!supportedExt.includes(ext)) {
    ext = (await fromBuffer(image))?.ext ?? "";
    logger.warn(`Image type "${ext}" may not be supported`);
    ext = defaultExt; // try to upload with default ext
  }

  const res = await this.axios.get<API.GetUploadImageParams.Response>(
    "/vila/api/bot/platform/getUploadImageParams",
    {
      headers: {
        "x-rpc-bot_villa_id": villaId,
      },
      params: <API.GetUploadImageParams.Params>{
        ext,
        md5: md5.hex(image),
      },
    },
  );
  if (res.retcode !== 0) {
    logger.error(
      `Failed to get upload params for ${imgUrl}: ${res.message}(${res.retcode})`,
    );
    return imgUrl;
  }

  const ossUrl = `${res.data.params.host}/`;
  const params: API.UploadImage.Request = {
    ...exclude(res.data.params, [
      "accessid",
      "content_disposition",
      "host",
      "x_oss_content_type",
      "x:extra",
    ]),
    "Content-Disposition": res.data.params.content_disposition,
    OSSAccessKeyId: res.data.params.accessid,
    "x-oss-content-type": res.data.params.x_oss_content_type,
    "x:extra": res.data.params.callback_var["x:extra"],
    file: image,
  };

  try {
    const res = await this.ctx.http.post<API.UploadImage.Response>(
      ossUrl,
      params,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    if (res.retcode !== 0) {
      throw new Error(`${res.message}(${res.retcode})`);
    }
    return res.data.url;
  } catch (err) {
    if (err instanceof Error)
      logger.error(`Failed to upload image ${imgUrl}: ${err.message}`);
    return imgUrl;
  }
}
