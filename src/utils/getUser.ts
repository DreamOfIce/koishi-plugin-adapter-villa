import type { Universal } from "@satorijs/satori";
import type { VillaBot } from "../bot";
import type { API } from "../structs";

import { logger } from "./logger";
import { isBot } from "./isBot";

export async function getUser(
  this: VillaBot,
  id: string,
  guildId?: string,
): Promise<Universal.User> {
  if (isBot(id)) {
    if (id === this.id) {
      return {
        id,
        name: this.user.name ?? "",
        avatar: this.user.avatar ?? "",
        isBot: true,
      };
    }
    logger.warn(
      `Get profile of bot user is not currently support(receive id '${id}')`,
    );
    return {
      id,
      isBot: true,
    };
  }
  const res = await this.axios.get<API.GetMember.Response>(
    "/vila/api/bot/platform/getMember",
    {
      params: <API.GetMember.Params>{ uid: id },
      headers: {
        "x-rpc-bot_villa_id": guildId,
      },
    },
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get profile of user ${id}: ${res.message}(${res.retcode})`,
    );
  }

  return {
    id,
    name: res.data.basic.nickname,
    avatar: res.data.basic.avatar_url,
    isBot: false,
  };
}
