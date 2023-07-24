import { type Bot, Schema } from "koishi";

export interface VillaBotConfig extends Bot.Config {
  id: string;
  secret: string;
  path: string;
  pubKey: string;
  transfer: {
    maxRetries: number;
  };
  verifyCallback: boolean;
}
export const VillaBotConfig: Schema<VillaBotConfig> = Schema.object({
  id: Schema.string().description("bot_id: 机器人的唯一标志").required(),
  secret: Schema.string()
    .role("secret")
    .description("bot_secret: 机器人鉴权唯一标志")
    .required(),
  path: Schema.string().description("服务器监听的路径").default("/villa"),
  pubKey: Schema.string()
    .role("textarea")
    .description("机器人的公钥")
    .required(),
  transfer: Schema.object({
    maxRetries: Schema.number().description("最大重试次数").default(3),
  })!,
  verifyCallback: Schema.boolean()
    .description("是否验证回调签名(生产环境强烈建议开启)")
    .default(true),
});
