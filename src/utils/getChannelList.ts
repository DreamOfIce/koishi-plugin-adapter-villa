import { Universal } from "@satorijs/satori";
import type { API } from "../structs";
import type { VillaBot } from "../bot";
import { logger } from "./logger";

export async function getChannelList(
  this: VillaBot,
  guildId: string,
): Promise<Universal.List<Universal.Channel>> {
  const res = await this.axios.get<API.GetRoomList.Response>(
    "/vila/api/bot/platform/getVillaGroupRoomList",
    {
      headers: {
        "x-rpc-bot_villa_id": guildId,
      },
    },
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get room list of ${guildId}: ${res.message}(${res.retcode})`,
    );
  }

  const channels: Universal.Channel[] = [];

  res.data.list.forEach((group) =>
    group.room_list.forEach((room) =>
      channels.push({
        id: `${guildId}~${room.room_id}`,
        name: room.room_name,
        type: Universal.Channel.Type.TEXT,
      }),
    ),
  );
  return { data: channels };
}
