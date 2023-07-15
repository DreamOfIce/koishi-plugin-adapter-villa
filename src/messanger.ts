import { type Dict, Element, Messenger, type SendOptions } from "koishi";
import { API, Message } from "./structs";
import { defineStruct, isBot, logger } from "./utils";
import type { VillaBot } from "./bot";

export class VillaMessanger extends Messenger<VillaBot> {
  private villaId: string;
  private roomId: string;
  private msg: Message.MsgContentInfo<Message.TextMsgContent> = {
    content: {
      text: "",
      entities: [],
    },
  };

  constructor(
    bot: VillaBot,
    channelId: string,
    guildId?: string,
    options?: SendOptions
  ) {
    if (!guildId) throw new Error("Villa doesn't support private message now");
    super(bot, channelId, guildId, options);

    [this.villaId, this.roomId] = channelId.split("~") as [string, string];
  }

  public override async flush(
    msg: Message.MsgContentInfo = this.msg,
    type: Message.MessageType = Message.MessageType.text
  ): Promise<void> {
    try {
      if (
        type !== Message.MessageType.text ||
        (msg.content as Message.TextMsgContent).text.length > 0
      ) {
        logger.debug(
          `Send message ${JSON.stringify(this.msg, undefined, 2)} to villa ${
            this.villaId
          } room ${this.roomId}`
        );
        const res = await this.bot.axios.post<API.SendMessage.Response>(
          "/vila/api/bot/platform/sendMessage",
          defineStruct<API.SendMessage.Request>({
            room_id: Number(this.roomId),
            object_name: type,
            msg_content: JSON.stringify(msg),
          }),
          {
            headers: {
              "x-rpc-bot_villa_id": this.villaId,
            },
          }
        );
        if (res.retcode !== 0) {
          throw new Error(
            `Failed to send message '${this.msg.content.text}': ${res.message}(${res.retcode})`
          );
        }

        const session = this.bot.session(this.session);
        session.messageId = `${res.data.bot_msg_id}:bot_msg`;
        session.timestamp = new Date().getTime();
        session.userId = this.bot.userId;
        this.results.push(session);
        session.app.emit(session, "send", session);
      }
    } catch (err) {
      if (err instanceof Error) this.errors.push(err);
    } finally {
      this.msg = {
        content: {
          text: "",
          entities: [],
        },
      };
    }
  }

  public override async visit(element: Element): Promise<void> {
    const offset = this.msg.content.text.length;
    switch (element.type) {
      case "text":
        this.msg.content.text += element.attrs["content"];
        break;
      case "at": {
        const { type, name, id } = element.attrs as Dict<string, string>;
        if (id && name) {
          const length = name.length + 1;
          this.msg.content.text += `@${name}`;
          if (isBot(id)) {
            this.msg.content.entities.push({
              offset,
              length,
              entity: {
                type: "mentioned_robot",
                bot_id: id,
              },
            });
          } else {
            this.msg.content.entities.push({
              offset,
              length,
              entity: {
                type: "mentioned_user",
                user_id: id,
              },
            });
          }
          if (
            this.msg.mentionedInfo?.type !== Message.MentionedType.allMember
          ) {
            this.msg.mentionedInfo = {
              type: Message.MentionedType.partMemeber,
              userIdList: this.msg.mentionedInfo?.userIdList ?? [],
            };
            this.msg.mentionedInfo.userIdList.push(id);
          }
        } else if (type === "all") {
          this.msg.content.text += "@全体成员";
          this.msg.content.entities.push({
            offset,
            length: 5,
            entity: {
              type: "mentioned_all",
            },
          });
          this.msg.mentionedInfo = {
            type: Message.MentionedType.allMember,
          };
        } else {
          logger.warn(
            `@user with role or type='here' is not currently support`
          );
        }

        break;
      }
      case "sharp": {
        const {
          id,
          name = `#${
            (await this.bot.getChannel(id)).channelName ?? id.split("~")[1]!
          }`,
        } = element.attrs as Dict<string, "id" | "name" | "guild">;
        const [villaId, roomId] = id.split("~") as [string, string];

        this.msg.content.text += name;
        this.msg.content.entities.push({
          offset,
          length: name.length,
          entity: {
            type: "villa_room_link",
            room_id: roomId,
            villa_id: villaId,
          },
        });
        break;
      }
      case "face": {
        this.msg.content.text += `[${
          (element.attrs as Dict<string, "id">)["id"]
        }]`;
        break;
      }
      case "a": {
        const { href } = element.attrs as Dict<string, "href">;
        const currentMsg = this.msg;
        await this.render(element.children);
        if (this.msg !== currentMsg) {
          logger.warn(
            `Message is flushed when rendering the child elements of <a>`
          );
          break;
        }
        const length = this.msg.content.text.length - offset;
        this.msg.content.entities.push({
          offset,
          length,
          entity: {
            type: "link",
            url: href,
          },
        });
        break;
      }
      case "image": {
        const url = (element.attrs as Dict<string, "url">)["url"];
        const newUrl = await this.bot.transferImage(url);
        await this.flush();
        const msg: Message.MsgContentInfo<Message.ImageMsgContent> = {
          content: {
            url: newUrl,
          },
        };
        await this.flush(msg, Message.MessageType.image);
        break;
      }
      case "audio":
      case "video":
      case "file": {
        const url = (element.attrs as Dict<string, "url">)["url"];
        logger.warn(
          `Media Element <${element.type}> is not currently support by villa bot`
        );
        this.msg.content.text += `![${element.type}-${element.type}](${
          /^(https?:\/\/)/i.test(url) ? url : `raw`
        })\n`;
        break;
      }
      case "b":
      case "strong":
      case "i":
      case "em":
      case "u":
      case "ins":
      case "s":
      case "del":
      case "sup":
      case "sub": {
        logger.warn("Currently villa does not support rich text");
        await this.render(element.children);
        break;
      }
      case "spl":
      case "code":
      case "p": {
        await this.render(element.children);
        this.msg.content.text += "\n";
        break;
      }
      case "quote": {
        const [id, timestamp] = (element.attrs as Dict<string, "id">)[
          "id"
        ].split("~") as [string, string];

        if (timestamp === "bot_msg") {
          logger.warn(`Quote with bot msg id is not support!`);
          this.errors.push(Error("Quote with bot msg id is not support!"));
        }

        this.msg.quote = {
          quoted_message_id: id,
          quoted_message_send_time: timestamp,
          original_message_id: id,
          original_message_send_time: timestamp,
        };
        break;
      }
      case "message": {
        await this.flush();
        await this.render(element.children, true);
        break;
      }
      default: {
        logger.warn(`Unknown element <${element.type}>, ignored`);
        await this.render(element.children);
        break;
      }
    }
  }
}
