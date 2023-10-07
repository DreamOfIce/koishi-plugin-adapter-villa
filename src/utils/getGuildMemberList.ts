import type { Universal } from "@satorijs/satori";
import type { VillaBot } from "../bot";
import type { API } from "../structs";

import { logger } from "./logger";

const pageSize = "100";

export async function getGuildMemberList(
  this: VillaBot,
  guildId: string,
  next?: string,
): Promise<Universal.List<Universal.GuildMember>> {
  const members: Universal.GuildMember[] = [];

  const res = await this.axios.get<API.GetVillaMembers.Response>(
    "/vila/api/bot/platform/getVilla",
    {
      headers: {
        "x-rpc-bot_villa_id": guildId,
      },
      params: <API.GetVillaMembers.Params>{
        offset_str: next,
        size: pageSize,
      },
    },
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get members of villa ${guildId}: ${res.message}(${res.retcode})`,
    );
  } else if (res.data.list.length === 0) {
    return { data: members };
  }

  res.data.list.forEach((member) =>
    members.push({
      name: member.basic.nickname,
      user: { id: member.basic.uid.toString(), isBot: false },
      avatar: member.basic.avatar_url,
      joinedAt: member.joined_at,
    }),
  );

  return { data: members, next: res.data.next_offset_str };
}
