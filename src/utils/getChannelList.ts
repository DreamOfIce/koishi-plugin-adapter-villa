import type { Universal } from "koishi";
import type { API } from "../structs";
import type { VillaBot } from "../bot";
import { logger } from "./logger";

export async function getChannelList(
  this: VillaBot,
  guildId: string
): Promise<Universal.Channel[]> {
  const res = await this.axios.get<API.GetRoomList.Response>(
    "/vila/api/bot/platform/getVillaGroupRoomList",
    {
      headers: {
        "x-rpc-villa_id": guildId,
      },
    }
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get room list of${guildId}: ${res.message}(${res.retcode})`
    );
  }

  const channels: Universal.Channel[] = [];

  res.data.list.forEach((group) =>
    group.room_list.forEach((room) =>
      channels.push({ channelId: room.room_id, channelName: room.room_name })
    )
  );
  return channels;
}
