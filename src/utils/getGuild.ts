import type { Universal } from "koishi";
import type { VillaBot } from "../bot";
import type { API } from "../structs";
import { logger } from "./logger";

export async function getGuild(
  this: VillaBot,
  guildId: string,
): Promise<Universal.Guild> {
  const res = await this.axios.get<API.GetVilla.Response>(
    "/vila/api/bot/platform/getVilla",
    {
      headers: {
        "x-rpc-villa_id": guildId,
      },
    },
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get data of villa ${guildId}: ${res.message}(${res.retcode})`,
    );
  }

  return {
    guildId: res.data.villa.villa_id.toString(),
    guildName: res.data?.villa.name,
  };
}
