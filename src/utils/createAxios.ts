import type { Context } from "koishi";

const apiServer = "https://bbs-api.miyoushe.com";

export const createAxios = (ctx: Context, id: string, secret: string) =>
  ctx.http.extend({
    endpoint: apiServer,
    headers: {
      "x-rpc-bot_id": id,
      "x-rpc-bot_secret": secret,
    },
  });
