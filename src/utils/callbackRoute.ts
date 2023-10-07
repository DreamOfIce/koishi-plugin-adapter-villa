import type { Context } from "@satorijs/satori";
import type { KoaContext, KoaMiddleware } from "../types";
import { logger } from "./logger";

import type { Callback } from "../structs";

const callbacks: Record<string, KoaMiddleware> = {};

export function registerCallbackRoute(
  path: string,
  context: Context,
  id: string,
  callback: KoaMiddleware,
) {
  logger.info(`Add callback for bot ${id}`);
  callbacks[id] = callback;
  context.router.post(path, async function (ctx: KoaContext, next) {
    const botId = ctx.request.body?.event?.robot?.template?.id;
    const [, callback] =
      Object.entries(callbacks).find(([id]) => id === botId) ?? [];
    if (botId && callback) {
      try {
        logger.info(`Receive callback of bot ${botId}`);
        logger.debug(JSON.stringify(ctx.request.body, undefined, 2));
        await callback(ctx, next);
        ctx.body = <Callback.Response>{
          message: "Success",
          retcode: 0,
        };
        ctx.status = 200;
      } catch (err) {
        logger.error(err);
        ctx.body = <Callback.Response>{
          message: "Error handling callback request",
          retcode: -1,
        };
        ctx.status = 500;
      }
    } else {
      logger.warn(`Receive callback of unknown bot: ${botId!}`);
      ctx.body = <Callback.Response>{
        message: "Bot not found",
        retcode: 1,
      };
      ctx.status = 400;
    }
  });
}

export const removeCallbackRoute = (id: string) => {
  logger.info(`Remove callback for bot ${id}`);
  delete callbacks[id];
};
