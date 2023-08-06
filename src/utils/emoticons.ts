import type { Context } from "koishi";
import { API, type Emoticon } from "../structs";
import { logger } from "./logger";
import type { VillaBot } from "../bot";

export const getAllEmoticons = async (
  ctx: Context,
): Promise<Emoticon.Emoticon[]> => {
  const res = await ctx.http.post<API.getAllEmoticons.Response>(
    "/vila/api/bot/platform/getAllEmoticons",
  );

  if (res.retcode !== 0) {
    logger.warn(`Failed to get emoticon list: ${res.message}(${res.retcode})`);
    return [];
  }

  return res.data.list;
};

export async function getEmoticonList(
  this: VillaBot,
): Promise<Emoticon.Emoticon[]> {
  if (
    this.config.emoticon.lazy &&
    (this.emoticon.list.length === 0 ||
      (this.emoticon.expries && new Date().getTime() <= this.emoticon.expries))
  ) {
    this.emoticon.expries =
      new Date().getTime() + this.config.emoticon.expires * 1000;
    return (this.emoticon.list = await getAllEmoticons(this.ctx));
  } else {
    return this.emoticon.list;
  }
}
