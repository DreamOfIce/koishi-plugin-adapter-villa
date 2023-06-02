import type { Fragment } from "koishi";
import type { VillaBot } from "../bot";
import { defineStruct } from "./defineStruct";
import { Message } from "../structs";
import { createMessage } from "./createMessage";
import { logger } from "./logger";

export async function sendMessage(
  this: VillaBot,
  roomId: string,
  content: Fragment,
  villaId: string
): Promise<string[]> {
  logger.debug(
    `Send message '${content.toString()}' to villa ${villaId} room ${roomId} `
  );
  const res = await this.axios.post<Message.Response>(
    "/vila/api/bot/platform/sendMessage",
    defineStruct<Message.Request>({
      room_id: Number(roomId),
      object_name: Message.MessageType.text,
      msg_content: JSON.stringify(createMessage(content)),
    }),
    {
      headers: {
        "x-rpc-bot_villa_id": villaId,
      },
    }
  );
  logger.debug(`Message send response: `, res);
  if (res.retcode != 0) {
    logger.error(
      `Failed to send message '${content.toString()}': ${res.message}`
    );
    return [];
  }
  return [res.data?.bot_msg_id];
}
