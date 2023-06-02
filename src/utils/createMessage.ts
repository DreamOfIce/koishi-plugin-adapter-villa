import type { Element } from "koishi";
import { Message } from "../structs";
import { logger } from "./logger";

export const createMessage = (
  msg: Element.Fragment
): Message.MsgContentInfo => {
  logger.warn("WIP");
  return {
    content: {
      text: typeof msg === "string" ? msg : msg.toString(),
      entities: [],
    },
  };
};
