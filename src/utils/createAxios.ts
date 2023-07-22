import type { Context } from "koishi";

export const createAxios = (
  ctx: Context,
  id: string,
  secret: string,
  apiServer: string,
) =>
  ctx.http.extend({
    endpoint: apiServer,
    headers: {
      "x-rpc-bot_id": id,
      "x-rpc-bot_secret": secret,
    },
  });
