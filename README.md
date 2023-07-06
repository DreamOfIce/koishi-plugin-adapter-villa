# koishi-plugin-adapter-villa

米游社 [大别野](https://dby.miyoushe.com) 的 [Koishi](https://koishi.chat) 适配器

## Todo

大别野 API 以及本项目仍处于早期开发阶段, 功能还非常简陋，请多多包涵

- [x] 收发文本消息
- [x] 发送 Element 格式的消息
- [x] 解析收到的消息
- [x] 发送外部图片
- [x] bot 入群、退群通知
- [x] 用户入群事件(`guild-member-added`)
- [x] 表情表套
- [ ] Oauth 登录
- [ ] 权限系统

  > 以下功能需要等待官方的 API 支持:

- [ ] 用户退群事件(`guild-member-deleted`)
- [ ] 发送本地/内联图片
- [ ] 富文本(粗体、斜体、下划线等)
- [ ] 私信

## 配置

> `bot_id`和`bot_secret`请前往官方大别野申请ヾ(≧▽≦\*)o

|  名称  |   类型   |               描述               |
| :----: | :------: | :------------------------------: |
|   id   | `string` |     bot_id: 机器人的唯一标志     |
| secret | `string` |  bot_secret: 机器人鉴权唯一标志  |
|  path  | `string` | 服务器监听的路径(默认为`/villa`) |

## License

MIT
