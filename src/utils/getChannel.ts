import type { Universal } from "koishi";
import type { API } from "../structs";
import type { VillaBot } from "../bot";
import { logger } from "./logger";
import { defineStruct } from "./defineStruct";

export async function getChannel(
  this: VillaBot,
  channelId: string,
  guildId: string
): Promise<Universal.Channel> {
  const res = await this.axios.get<API.GetRoom.Response>(
    "/vila/api/bot/platform/getVilla",
    {
      params: defineStruct<API.GetRoom.Params>({
        room_id: channelId,
      }),
      headers: {
        "x-rpc-villa_id": guildId,
      },
    }
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get data of room ${channelId} in ${guildId}: ${res.message}(${res.retcode})`
    );
  }

  return {
    channelId: res.data.room.room_id.toString(),
    channelName: res.data?.room.room_name,
  };
}
