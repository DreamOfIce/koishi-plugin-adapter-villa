import type { VillaBot } from "../bot";
import type { API } from "../structs";
import { defineStruct } from "./defineStruct";
import { logger } from "./logger";

export async function deleteMessage(
  this: VillaBot,
  channelId: string,
  messageId: string,
): Promise<void> {
  const [villaId, roomId] = channelId.split("~") as [string, string];
  const [id, timestamp] = messageId.split("~") as [string, string];

  if (timestamp === "bot_msg") {
    logger.warn(`Cannot delete message send by bot!`);
    return;
  }

  const res = await this.axios.post<API.RecallMessage.Response>(
    "/vila/api/bot/platform/recallMessage",
    defineStruct<API.RecallMessage.Request>({
      msg_uid: id,
      msg_time: Number(timestamp),
      room_id: roomId,
    }),
    {
      headers: {
        "x-rpc-bot_villa_id": villaId,
      },
    },
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to recall message ${id}: ${res.message}(${res.retcode})`,
    );
  }
}
