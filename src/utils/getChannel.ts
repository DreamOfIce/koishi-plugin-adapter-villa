import { Universal } from "@satorijs/satori";
import type { API } from "../structs";
import type { VillaBot } from "../bot";
import { logger } from "./logger";

export async function getChannel(
  this: VillaBot,
  channelId: string,
): Promise<Universal.Channel> {
  const [villaId, roomId] = channelId.split("~") as [string, string];

  const res = await this.axios.get<API.GetRoom.Response>(
    "/vila/api/bot/platform/getVilla",
    {
      params: <API.GetRoom.Params>{
        room_id: roomId,
      },
      headers: {
        "x-rpc-bot_villa_id": villaId,
      },
    },
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get data of room ${roomId} in ${villaId}: ${res.message}(${res.retcode})`,
    );
  }

  return {
    id: channelId,
    name: res.data?.room.room_name,
    type: Universal.Channel.Type.TEXT,
  };
}
