import type { Universal } from "koishi";
import type { VillaBot } from "../bot";
import type { API } from "../structs";
import { defineStruct } from "./defineStruct";
import { logger } from "./logger";

const pageSize = "100";

export async function getGuildMemberList(
  this: VillaBot,
  guildId: string
): Promise<Universal.GuildMember[]> {
  const members: Universal.GuildMember[] = [];
  let offset = 0,
    end = false;

  while (!end) {
    const res = await this.axios.get<API.GetVillaMembers.Response>(
      "/vila/api/bot/platform/getVilla",
      {
        headers: {
          "x-rpc-villa_id": guildId,
        },
        params: defineStruct<API.GetVillaMembers.Params>({
          offset_str: offset.toString(),
          size: pageSize,
        }),
      }
    );

    if (res.retcode !== 0) {
      logger.warn(
        `Failed to get members of villa ${guildId}: ${res.message}(${res.retcode})`
      );
    }

    offset = Number(res.data.next_offset_str);

    if (res.data.list.length === 0) {
      end = true;
    } else {
      res.data.list.forEach((member) =>
        members.push({
          userId: member.basic.uid.toString(),
          username: member.basic.nickname,
          nickname: member.basic.nickname,
          avatar: member.basic.avatar_url,
          isBot: false,
        })
      );
    }
  }

  return [];
}
