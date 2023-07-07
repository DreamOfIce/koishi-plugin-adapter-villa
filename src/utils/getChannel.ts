import type { Universal } from "koishi";
import type { API } from "../structs";
import type { VillaBot } from "../bot";
import { logger } from "./logger";
import { defineStruct } from "./defineStruct";

export async function getChannel(
  this: VillaBot,
  channelId: string
): Promise<Universal.Channel> {
  const [villaId, roomId] = channelId.split(":") as [string, string];

  const res = await this.axios.get<API.GetRoom.Response>(
    "/vila/api/bot/platform/getVilla",
    {
      params: defineStruct<API.GetRoom.Params>({
        room_id: roomId,
      }),
      headers: {
        "x-rpc-villa_id": villaId,
      },
    }
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get data of room ${roomId} in ${villaId}: ${res.message}(${res.retcode})`
    );
  }

  return {
    channelId,
    channelName: res.data?.room.room_name,
  };
}
