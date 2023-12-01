import { Quester, Schema } from "@satorijs/satori";

export interface VillaBotConfig extends Quester.Config {
  id: string;
  secret: string;
  path: string;
  pubKey: string;
  verifyCallback: boolean;
  emoticon: {
    strict: boolean;
    lazy: boolean;
    expires: number;
  };
  image: {
    method: "auto" | "transfer" | "upload";
    transferMaxRetries: number;
  };
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
  verifyCallback: Schema.boolean()
    .description("是否验证回调签名(生产环境强烈建议开启)")
    .default(true),
  emoticon: Schema.intersect([
    Schema.object({
      strict: Schema.boolean()
        .default(true)
        .description("是否启用表情强匹配, 关闭则匹配所有`[foo]`格式的字符串"),
      lazy: Schema.boolean().default(true).hidden(),
      expires: Schema.number().default(3600).hidden(),
    }).description("表情设置"),
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
  image: Schema.object({
    method: Schema.union(["auto", "transfer", "upload"])
      .description("图片上传方式")
      .default("auto"),
    transferMaxRetries: Schema.number()
      .description("转存最大重试次数")
      .default(3),
  }).description("图片设置")!,
});
