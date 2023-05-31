import type { Callback } from "../structs";
import type { Context, Request } from "koa";

export type koaMiddleware = (
  ctx: KoaContext,
  next: () => Promise<void>
) => Promise<void> | void;

interface CalllbackRequest extends Request {
  body?: Callback;
}
export interface KoaContext extends Context {
  request: CalllbackRequest;
}
