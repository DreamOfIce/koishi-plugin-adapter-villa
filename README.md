# koishi-plugin-adapter-villa

米游社 [大别野](https://dby.miyoushe.com) 的 [Koishi](https://koishi.chat) 适配器

## Todo

大别野 API 以及本项目仍处于早期开发阶段, 功能还非常简陋，请多多包涵

- [x] 收发文本消息
- [x] 发送 Element 格式的消息
- [x] 解析收到的消息
- [x] 发送图片
- [x] bot 入群、退群通知
- [x] 用户入群事件(`guild-member-added`)
- [x] 表情表态
- [x] 回调签名验证
- [ ] Oauth 登录
- [ ] 权限系统

> 以下功能需要等待官方的 API 支持:

    - [ ] 用户退群事件(`guild-member-deleted`)
    - [ ] 富文本(粗体、斜体、下划线等)
    - [ ] 私信

## 配置

> `bot_id`和`bot_secret`请前往官方大别野申请ヾ(≧▽≦\*)o

|           名称           |   类型    |                                       描述                                       | 必填/默认值 |
| :----------------------: | :-------: | :------------------------------------------------------------------------------: | :---------: |
|            id            | `string`  |                             bot_id: 机器人的唯一标志                             |    必填     |
|          secret          | `string`  |                          bot_secret: 机器人鉴权唯一标志                          |    必填     |
|          pubKey          | `string`  |                                   机器人的公钥                                   |    必填     |
|         emoticon         | `object`  |                                   表情相关配置                                   |      -      |
|     emoticon.strict      | `boolean` |              是否启用表情强匹配, 关闭则匹配所有`[foo]`格式的字符串               |   `true`    |
|      emoticon.lazy       | `boolean` |        是否启用表情列表懒加载, 关闭可略微提高响应性能, 但可能产生更多请求        |   `true`    |
|     emoticon.expires     | `boolean` |                            表情列表缓存时间(单位: 秒)                            |    86400    |
|           path           | `string`  |                                 服务器监听的路径                                 |  `/villa`   |
|          image           | `object`  |                                   图片相关配置                                   |      -      |
|       image.method       | `string`  | 图片上传方式: `auto`自动选择, `upload`始终使用上传API, `transfer`始终使用转存API |   `auto`    |
| image.transferMaxRetries | `number`  |                           API 返回 429 时最大重试次数                            |     `3`     |

## License

MIT
