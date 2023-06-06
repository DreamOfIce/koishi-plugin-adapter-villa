import { type Dict, Element, Messenger, type SendOptions } from "koishi";
import { Message } from "./structs";
import { defineStruct, isBot, logger } from "./utils";
import type { VillaBot } from "./bot";

export class VillaMessanger extends Messenger<VillaBot> {
  declare guildId: string;
  private msg: Message.MsgContentInfo = {
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
  }

  public override async flush(): Promise<void> {
    const session = this.bot.session(this.session);
    try {
      logger.debug(
        `Send message ${JSON.stringify(this.msg, undefined, 2)} to villa ${
          this.guildId
        } room ${this.channelId}`
      );
      const res = await this.bot.axios.post<Message.Response>(
        "/vila/api/bot/platform/sendMessage",
        defineStruct<Message.Request>({
          room_id: Number(this.channelId),
          object_name: Message.MessageType.text,
          msg_content: JSON.stringify(this.msg),
        }),
        {
          headers: {
            "x-rpc-bot_villa_id": this.guildId,
          },
        }
      );
      if (res.retcode !== 0) {
        throw new Error(
          `Failed to send message '${this.msg.content.text}': ${res.message}(${res.retcode})`
        );
      }
      session.messageId = res.data.bot_msg_id;
      session.timestamp = new Date().getTime();
      session.userId = this.bot.userId;
      this.results.push(session);
      session.app.emit(session, "send", session);
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
          name = `#房间${id}`,
          guild = this.guildId, // a custom attr
        } = element.attrs as Dict<string, "id" | "name" | "guild">;
        this.msg.content.text += name;
        this.msg.content.entities.push({
          offset,
          length: name.length,
          entity: {
            type: "villa_room_link",
            room_id: id,
            villa_id: guild,
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
            `The message is flushed when rendering the child elements of <a>`
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
      case "image":
      case "audio":
      case "video":
      case "file": {
        const url = (element.attrs as Dict<string, "url">)["url"];
        logger.warn(
          `Media Element <${element.type}> is not currently support by villa bot`
        );
        this.msg.content.text += `![${element.type}](${
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
        this.msg.quote = {
          quoted_message_id: (element.attrs as Dict<string, "id">)["id"],
          quoted_message_send_time: new Date().getTime().toString(),
          original_message_id: (element.attrs as Dict<string, "id">)["id"],
          original_message_send_time: new Date().getTime().toString(),
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
