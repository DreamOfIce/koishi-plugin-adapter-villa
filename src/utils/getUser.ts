import type { Universal } from "koishi";
import type { VillaBot } from "../bot";
import type { Member } from "../structs";
import { defineStruct } from "./defineStruct";
import { logger } from "./logger";

export async function getUser(
  this: VillaBot,
  userId: string
): Promise<Universal.User> {
  if (userId.startsWith("bot_")) {
    if (userId === this.id) {
      return {
        username: this.username ?? "",
        nickname: this.nickname ?? "",
        avatar: this.avatar ?? "",
        userId,
        isBot: true,
      };
    }
    logger.warn(
      `Get profile of bot user is not currently support(receive id '${userId}')`
    );
    return {
      userId,
      isBot: true,
    };
  }
  const res = await this.axios.get<Member.Response>(
    "/vila/api/bot/platform/getMember",
    {
      params: defineStruct<Member.Params>({ uid: userId }),
    }
  );
  return {
    userId,
    username: res.basic.nickname,
    nickname: res.basic.nickname,
    avatar: res.basic.avatar_url,
    isBot: false,
  };
}
