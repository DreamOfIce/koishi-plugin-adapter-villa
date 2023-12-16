import {} from "@satorijs/router";
import {
  Bot,
  type Context,
  type Fragment,
  h,
  Quester,
  Universal,
} from "@satorijs/satori";
import type { SendOptions } from "@satorijs/protocol";
import { VillaBotConfig } from "./config";
import {
  calcSecretHash,
  createAxios,
  deleteMessage,
  getAllEmoticons,
  getChannel,
  getChannelList,
  getEmoticonList,
  getGuild,
  getGuildMemberList,
  getUser,
  logger,
  parseMessage,
  registerCallbackRoute,
  removeCallbackRoute,
  transferImage,
  verifyCallback,
} from "./utils";
import type { KoaContext } from "./types";
import { Callback, type Emoticon, Message } from "./structs";
import { VillaMessanger } from "./messanger";
import { uploadImage } from "./utils/uploadImage";

export class VillaBot<
  C extends Context = Context,
  T extends VillaBotConfig = VillaBotConfig,
> extends Bot<C, T> {
  static inject = ["router"];

  /** bot id */
  protected id: string;
  /** bot secret */
  protected secret: string;
  /** bot description  */
  protected description = "";

  /** Currently customisation is not supported */
  protected apiServer = "https://bbs-api.miyoushe.com";

  /** emoticons */
  protected emoticon: {
    list: Emoticon.Emoticon[];
    task?: ReturnType<typeof setInterval>;
    expries?: number;
  } = { list: [] };

  /** axios instance with auth header */
  public axios: Quester;

  public constructor(ctx: C, config: T) {
    super(ctx, config, "villa");

    this.id = config.id;
    this.secret = config.secret;
    this.selfId = config.id;
    this.user = { id: config.id, isBot: true };

    this.axios = ctx.http;
  }

  public onError(error: Error) {
    logger.error(error);
  }

  public override async start(): Promise<void> {
    await super.start();
    this.axios = createAxios(
      this.ctx,
      this.config.id,
      await calcSecretHash(this.secret, this.config.pubKey),
      this.apiServer,
    );
    if (this.config.emoticon.strict && !this.config.emoticon.lazy) {
      this.emoticon.list = await getAllEmoticons(this.axios, this.apiServer);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.emoticon.task = setInterval(async () => {
        this.emoticon.list = await getAllEmoticons(this.axios, this.apiServer);
      }, this.config.emoticon.expires);
    }
    registerCallbackRoute(
      this.config.path,
      this.ctx,
      this.id,
      this.handleCallback.bind(this),
    );
  }

  public override async stop(): Promise<void> {
    await super.stop();
    this.emoticon.list = [];
    if (this.emoticon.task) {
      clearInterval(this.emoticon.task);
    }
    removeCallbackRoute(this.id);
  }

  public override getSelf(): Promise<Universal.User> {
    return this.getUser(this.selfId);
  }

  public override async sendMessage(
    channelId: string,
    content: Fragment,
    guildId?: string | undefined,
    options?: SendOptions | undefined,
  ): Promise<string[]> {
    return (
      await new VillaMessanger(this, channelId, guildId, options).send(content)
    ).map((msg) => msg.id!);
  }

  protected async handleCallback(ctx: KoaContext) {
    const { body } = ctx.request;
    if (!body) {
      ctx.body = <Callback.Response>{
        message: "Receive empty body",
        retcode: 400,
      };
      ctx.status = 400;
      return;
    }

    if (
      this.config.verifyCallback &&
      !(await verifyCallback(
        ctx.header["x-rpc-bot_sign"] as string,
        this.config.secret,
        this.config.pubKey,
        ctx.request.rawBody,
      ))
    ) {
      logger.warn("Callback signature mismatch, ignored");
      ctx.body = <Callback.Response>{
        message: "Invalid signature",
        retcode: 403,
      };
      ctx.status = 403;
      return;
    }

    this.user.avatar = body.event.robot.template.icon;
    this.user.name = body.event.robot.template.name;
    this.description = body.event.robot.template.desc;

    const eventData = body.event.extend_data.EventData;
    switch (body.event.type) {
      case Callback.RobotEventType.JoinVilla: {
        const session = super.session({
          type: "guild-member-added",
          subtype: "group",
          guild: { id: body.event.robot.villa_id.toString() },
          timestamp: eventData.JoinVilla.join_at,
          user: { id: eventData.JoinVilla.join_uid.toString() },
        });
        logger.info(
          `New member of villa ${body.event.robot.villa_id}: ${eventData.JoinVilla.join_uid}`,
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.SendMessage: {
        const msg = <Callback.MsgContentInfo>(
          JSON.parse(eventData.SendMessage.content)
        );
        const message: Universal.Message = {
          id: `${eventData.SendMessage.msg_uid}~${eventData.SendMessage.send_at}`,
          content:
            eventData.SendMessage.object_name === Message.MessageNumberType.text
              ? (msg.content as Message.TextMsgContent).text
              : "",
          elements: parseMessage(eventData.SendMessage.object_name, msg, {
            emoticonList: await this.getEmoticonList(),
            strictEmoticon: this.config.emoticon.strict,
          }),
        };
        if (eventData.SendMessage.quote_msg)
          message.quote = {
            id: `${eventData.SendMessage.quote_msg.msg_uid}~${eventData.SendMessage.quote_msg.send_at}`,
            content: eventData.SendMessage.quote_msg.content,
          };
        const session = super.session({
          type: "message",
          channel: {
            id: `${body.event.robot.villa_id}~${eventData.SendMessage.room_id}`,
            type: Universal.Channel.Type.TEXT,
          },
          guild: { id: body.event.robot.villa_id.toString() },
          member: {
            name: eventData.SendMessage.nickname,
            avatar: msg.user.portraitUri,
          },
          message,
          platform: this.platform,
          timestamp: eventData.SendMessage.send_at,
          selfId: this.selfId,
          user: {
            id: eventData.SendMessage.from_user_id.toString(),
            avatar: msg.user.portraitUri,
          },
        });
        logger.info(
          `Receive message '${message.content}'(${eventData.SendMessage.msg_uid})`,
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.CreateRobot: {
        const session = super.session({
          type: "guild-added",
          guild: { id: eventData.CreateRobot.villa_id.toString() },
          timestamp: new Date().getTime(),
        });
        logger.info(
          `Bot ${this.id} has been added to villa ${eventData.CreateRobot.villa_id}`,
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.DeleteRobot: {
        const session = super.session({
          type: "guild-deleted",
          guild: { id: eventData.DeleteRobot.villa_id.toString() },
          timestamp: new Date().getTime(),
        });
        logger.info(
          `Bot ${this.id} has been removed from villa ${eventData.DeleteRobot.villa_id}`,
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.AddQuickEmoticon: {
        const session = super.session({
          type: `reaction-${
            eventData.AddQuickEmoticon.is_cancel ? "deleted" : "added"
          }`,
          channel: {
            id: `${eventData.AddQuickEmoticon.villa_id}~${eventData.AddQuickEmoticon.room_id}`,
            type: Universal.Channel.Type.TEXT,
          },
          guild: { id: eventData.AddQuickEmoticon.villa_id.toString() },
          message: {
            elements: [
              h("face", {
                id: eventData.AddQuickEmoticon.emoticon_id,
                name: eventData.AddQuickEmoticon.emoticon,
                platform: this.platform,
              }),
            ],
            quote: {
              elements: [
                h("quote", {
                  id: eventData.AddQuickEmoticon.msg_uid.toString(),
                }),
              ],
              messageId: `${eventData.AddQuickEmoticon.msg_uid}:0`,
            },
          },
          timestamp: new Date().getTime(),
          user: { id: eventData.AddQuickEmoticon.uid.toString() },
        });
        logger.info(
          `Receive reaction '${eventData.AddQuickEmoticon.emoticon}' on message ${eventData.AddQuickEmoticon.msg_uid}`,
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.AuditCallback:
        // todo
        break;
      default:
        ctx.body = <Callback.Response>{
          message: "Unknown event",
          retcode: -1,
        };
        ctx.status = 400;
    }
  }

  public override getGuildMember(
    guildId: string,
    userId: string,
  ): Promise<Universal.GuildMember> {
    return this.getUser(userId, guildId);
  }

  public getAllEmoticons = getAllEmoticons;
  public getEmoticonList = getEmoticonList;
  public transferImage = transferImage;
  public uploadImage = uploadImage;

  public override deleteMessage = deleteMessage;
  public override getChannel = getChannel;
  public override getChannelList = getChannelList;
  public override getGuild = getGuild;
  public override getGuildMemberList = getGuildMemberList;
  public override getUser = getUser;

  public override platform = "villa";
}

export namespace VillaBot {
  export const Config = VillaBotConfig;
}
