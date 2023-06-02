import type { Universal } from "koishi";
import type { VillaBot } from "../bot";
import type { Member } from "../structs";
import { defineStruct } from "./defineStruct";

export async function getUser(
  this: VillaBot,
  userId: string
): Promise<Universal.User> {
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
    discriminator: res.basic.introduce,
    isBot: false,
  };
}
