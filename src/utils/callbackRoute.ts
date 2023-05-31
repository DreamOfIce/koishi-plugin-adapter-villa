import type { Context } from "koishi";
import type { KoaContext, koaMiddleware } from "../types";
import { logger } from "./logger";
import { defineCallbackResponse } from "../structs";

const callbacks: Record<string, koaMiddleware> = {};

export function registerCallbackRoute(
  context: Context,
  id: string,
  callback: koaMiddleware
) {
  logger.info(`Add callback for bot ${id}`);
  callbacks[id] = callback;
  context.router.post("/villa", async function (ctx: KoaContext, next) {
    const botId = ctx.request.body?.event?.robot?.template?.id;
    const [, callback] =
      Object.entries(callbacks).find(([id]) => id === botId) ?? [];
    if (callback) {
      try {
        logger.info(`Receive callback of bot ${botId}`);
        logger.debug(ctx.request.body);
        await callback(ctx, next);
        ctx.body = defineCallbackResponse({ message: "Success", retcode: 0 });
        ctx.status = 200;
      } catch (err) {
        logger.error(err);
        ctx.body = defineCallbackResponse({
          message: "Error handling callback request",
          retcode: -1,
        });
        ctx.status = 500;
      }
    } else {
      logger.warn(`Receive callback of unknown bot: ${botId}`);
      ctx.body = defineCallbackResponse({
        message: "Bot not found",
        retcode: 1,
      });
      ctx.status = 400;
    }
  });
}

export const removeCallbackRoute = (id: string) => {
  logger.info(`Remove callback for bot ${id}`);
  delete callbacks[id];
};
