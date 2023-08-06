import { type Bot, Schema } from "koishi";

export interface VillaBotConfig extends Bot.Config {
  id: string;
  secret: string;
  emoticon: {
    strict: boolean;
    lazy: boolean;
    expires: number;
  };
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
  emoticon: Schema.intersect([
    Schema.object({
      strict: Schema.boolean()
        .default(true)
        .description("是否启用表情强匹配, 关闭则匹配所有`[foo]`格式的字符串"),
      lazy: Schema.boolean().default(true).hidden(),
      expires: Schema.number().default(3600).hidden(),
    }),
    Schema.union([
      Schema.object({
        strict: Schema.const(true),
        lazy: Schema.boolean()
          .description(
            "是否启用表情列表懒加载, 关闭可略微提高响应性能, 但可能产生更多请求",
          )
          .default(true),
        expires: Schema.number()
          .description("表情列表缓存时间(单位: 秒)")
          .default(86400),
      }),
      Schema.object({}),
    ]),
  ])!,
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
