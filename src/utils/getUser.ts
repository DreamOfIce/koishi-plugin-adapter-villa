import type { Universal } from "koishi";
import type { VillaBot } from "../bot";
import type { Member } from "../structs";

export async function getUser(
  this: VillaBot,
  userId: string
): Promise<Universal.User> {
  const { data }: { data: Member } = await this.ctx.http.get(
    "/vila/api/bot/platform/getMember",
    { params: { uid: userId } }
  );
  return {
    userId,
    username: data.basic.nickname,
    nickname: data.basic.nickname,
    avatar: data.basic.avatar,
    discriminator: data.basic.introduce,
    isBot: false,
  };
}
