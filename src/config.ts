import { type Bot, Schema } from "koishi";

export interface VillaBotConfig extends Bot.Config {
  id: string;
  secret: string;
}
export const VillaBotConfig: Schema<VillaBotConfig> = Schema.object({
  id: Schema.string().description("bot_id: 机器人的唯一标志").required(),
  secret: Schema.string()
    .description("bot_secret: 机器人鉴权唯一标志")
    .required(),
});
