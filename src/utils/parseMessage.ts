import type { Element } from "koishi";
import { Message } from "../structs";

export const parseMessage = (msg: Message.MsgContentInfo): Element[] => {
  const elements: Element[] = [];
  msg.content.entities.forEach((_entity) => {
    /* WIP */
  });
  return elements;
};
