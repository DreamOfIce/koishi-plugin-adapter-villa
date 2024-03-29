import {
  Context,
  type Dict,
  Element,
  Messenger,
  Universal,
} from "@satorijs/satori";
import type { SendOptions } from "@satorijs/protocol";
import { API, Message } from "./structs";
import { isBot, logger } from "./utils";
import type { VillaBot } from "./bot";

export class VillaMessanger<C extends Context = Context> extends Messenger<
  C,
  VillaBot<C>
> {
  private villaId: string;
  private roomId: string;
  private msg: Message.MsgContentInfo<Message.TextMsgContent> = {
    content: {
      text: "",
      entities: [],
    },
  };

  constructor(
    bot: VillaBot<C>,
    channelId: string,
    guildId?: string,
    options?: SendOptions,
  ) {
    if (!guildId) throw new Error("Villa doesn't support private message now");
    super(bot, channelId, guildId, options);

    [this.villaId, this.roomId] = channelId.split("~") as [string, string];
  }

  public override async flush(
    msg: Message.MsgContentInfo = this.msg,
    type: Message.MessageType = Message.MessageType.text,
  ): Promise<void> {
    try {
      if (
        type !== Message.MessageType.text ||
        (msg.content as Message.TextMsgContent).text.length > 0
      ) {
        logger.debug(
          `Send message ${JSON.stringify(this.msg, undefined, 2)} to villa ${
            this.villaId
          } room ${this.roomId}`,
        );
        const res = await this.bot.axios.post<API.SendMessage.Response>(
          "/vila/api/bot/platform/sendMessage",
          <API.SendMessage.Request>{
            room_id: Number(this.roomId),
            object_name: type,
            msg_content: JSON.stringify(msg),
          },
          {
            headers: {
              "x-rpc-bot_villa_id": this.villaId,
            },
          },
        );
        if (res.retcode !== 0) {
          throw new Error(
            `Failed to send message '${this.msg.content.text}': ${res.message}(${res.retcode})`,
          );
        }

        const session = this.bot.session(this.session);
        const message: Universal.Message = {
          id: `${res.data.bot_msg_id}:bot_msg`,
          timestamp: new Date().getTime(),
          user: this.bot.user,
        };
        session.event.message = message;
        this.results.push(message);
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
        const { type, name, id } = <Dict<string, string>>element.attrs;
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
            `@user with role or type='here' is not currently support`,
          );
        }

        break;
      }
      case "sharp": {
        const {
          id,
          name = `#${
            (await this.bot.getChannel(id)).name ?? id.split("~")[1]!
          }`,
        } = <Dict<string, "id" | "name">>element.attrs;
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
          (<Dict<string, "id">>element.attrs)["id"]
        }]`;
        break;
      }
      case "a": {
        const { href } = <Dict<string, "href">>element.attrs;
        const currentMsg = this.msg;
        await this.render(element.children);
        if (this.msg !== currentMsg) {
          logger.warn(
            `Message is flushed during rendering the child elements of <a>`,
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
        const url = (<Dict<string, "url">>element.attrs)["url"];
        let imgUrl: string;
        switch (this.bot.config.image.method) {
          case "auto": {
            const { protocol } = new URL(url);
            switch (protocol) {
              // TODO: remove legacy support for protocol base64:
              case "base64:":
              case "file:":
              case "data:":
                imgUrl = await this.bot.uploadImage(url, this.villaId);
                break;
              default:
                imgUrl = await this.bot.transferImage(url, this.villaId);
            }
            break;
          }
          case "transfer":
            imgUrl = await this.bot.transferImage(url, this.villaId);
            break;
          case "upload":
            imgUrl = await this.bot.uploadImage(url, this.villaId);
            break;
        }
        const { protocol } = new URL(imgUrl);
        if (protocol !== "http:" && protocol !== "https:")
          throw new Error(`Unsupported image protocol: ${protocol}`);
        await this.flush();
        const msg: Message.MsgContentInfo<Message.ImageMsgContent> = {
          content: {
            url: imgUrl,
          },
        };
        await this.flush(msg, Message.MessageType.image);
        break;
      }
      case "audio":
      case "video":
      case "file": {
        const url = (<Dict<string, "url">>element.attrs)["url"];
        logger.warn(
          `Media Element <${element.type}> is not currently support by villa bot`,
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
        const [id, timestamp] = (<Dict<string, "id">>element.attrs)["id"].split(
          "~",
        ) as [string, string];

        if (timestamp === "bot_msg") {
          logger.warn(`Quote with bot msg id is not support!`);
          this.errors.push(Error("Quote with bot msg id is not support!"));
        }

        this.msg.quote = {
          quoted_message_id: id,
          quoted_message_send_time: Number(timestamp),
          original_message_id: id,
          original_message_send_time: Number(timestamp),
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
