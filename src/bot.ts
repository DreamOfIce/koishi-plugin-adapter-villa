import {
  Bot,
  type Context,
  type Fragment,
  h,
  Quester,
  type SendOptions,
  type Universal,
} from "koishi";
import { VillaBotConfig } from "./config";
import {
  createAxios,
  defineStruct,
  deleteMessage,
  getChannel,
  getChannelList,
  getGuild,
  getGuildMemberList,
  getUser,
  logger,
  parseMessage,
  registerCallbackRoute,
  removeCallbackRoute,
} from "./utils";
import type { KoaContext } from "./types";
import { Callback, Message } from "./structs";
import { VillaMessanger } from "./messanger";

export class VillaBot extends Bot<VillaBotConfig> {
  /** bot id */
  protected id: string;
  /** bot secret */
  protected secret: string;
  /** bot description  */
  protected description = "";

  /** Currently ustomisation is not supported */
  protected apiServer = "https://bbs-api.miyoushe.com";

  /** axios instance with auth header */
  public axios: Quester;

  public constructor(ctx: Context, config: VillaBotConfig) {
    super(ctx, config);

    this.id = config.id;
    this.secret = config.secret;
    this.selfId = config.id;

    this.axios = createAxios(ctx, config.id, config.secret, this.apiServer);
  }

  public onError(error: Error) {
    logger.error(error);
  }

  public override async start(): Promise<void> {
    await super.start();
    registerCallbackRoute(
      this.config.path,
      this.ctx,
      this.id,
      this.handleCallback.bind(this)
    );
  }

  public override async stop(): Promise<void> {
    await super.stop();
    removeCallbackRoute(this.id);
  }

  public override getSelf(): Promise<Universal.User> {
    return this.getUser(this.selfId);
  }

  public override sendMessage(
    channelId: string,
    content: Fragment,
    guildId?: string | undefined,
    options?: SendOptions | undefined
  ): Promise<string[]> {
    return new VillaMessanger(this, channelId, guildId, options).send(content);
  }

  protected handleCallback(ctx: KoaContext) {
    const { body } = ctx.request;
    if (!body) {
      ctx.body = defineStruct<Callback.Response>({
        message: "Receive empty body",
        retcode: 400,
      });
      ctx.status = 400;
      return;
    }

    this.avatar = body.event.robot.template.icon;
    this.username = body.event.robot.template.name;
    this.description = body.event.robot.template.desc;

    const eventData = body.event.extend_data.EventData;
    switch (body.event.type) {
      case Callback.RobotEventType.JoinVilla: {
        const session = super.session({
          type: "guild-member-added",
          subtype: "group",
          guildId: body.event.robot.villa_id.toString(),
          timestamp: eventData.JoinVilla.join_at,
          userId: eventData.JoinVilla.join_uid.toString(),
        });
        logger.info(
          `New member of villa ${body.event.robot.villa_id}: ${eventData.JoinVilla.join_uid}`
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.SendMessage: {
        const msg = JSON.parse(
          eventData.SendMessage.content
        ) as Callback.MsgContentInfo;
        const content =
          eventData.SendMessage.object_name === Message.MessageNumberType.text
            ? (msg.content as Message.TextMsgContent).text
            : "";
        const session = super.session({
          author: {
            username: eventData.SendMessage.nickname,
            nickname: eventData.SendMessage.nickname,
            userId: eventData.SendMessage.from_user_id.toString(),
            avatar: msg.user.portraitUri,
          },
          type: "message",
          subtype: "group",
          channelId: `${body.event.robot.villa_id}~${eventData.SendMessage.room_id}`,
          content,
          elements: parseMessage(eventData.SendMessage.object_name, msg),
          guildId: body.event.robot.villa_id.toString(),
          messageId: `${eventData.SendMessage.msg_uid}~${eventData.SendMessage.send_at}`,
          timestamp: eventData.SendMessage.send_at,
          userId: eventData.SendMessage.from_user_id.toString(),
        });
        logger.info(
          `Receive message '${content}'(${eventData.SendMessage.msg_uid})`
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.CreateRobot: {
        const session = super.session({
          type: "guild-added",
          subtype: "group",
          guildId: eventData.CreateRobot.villa_id.toString(),
          timestamp: new Date().getTime(),
        });
        logger.info(
          `Bot ${this.id} has been added to villa ${eventData.CreateRobot.villa_id}`
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.DeleteRobot: {
        const session = super.session({
          type: "guild-deleted",
          subtype: "group",
          guildId: eventData.DeleteRobot.villa_id.toString(),
          timestamp: new Date().getTime(),
        });
        logger.info(
          `Bot ${this.id} has been removed from villa ${eventData.DeleteRobot.villa_id}`
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.AddQuickEmoticon: {
        const session = super.session({
          type: `reaction-${
            eventData.AddQuickEmoticon.is_cancel ? "deleted" : "added"
          }`,
          subtype: "group",
          channelId: `${eventData.AddQuickEmoticon.villa_id}~${eventData.AddQuickEmoticon.room_id}`,
          elements: [
            h("face", {
              id: eventData.AddQuickEmoticon.emoticon_id,
              name: eventData.AddQuickEmoticon.emoticon,
              platform: this.platform,
            }),
          ],
          guildId: eventData.AddQuickEmoticon.villa_id.toString(),
          quote: {
            author: {
              userId: eventData.AddQuickEmoticon.uid.toString(),
            },
            channelId: `${eventData.AddQuickEmoticon.villa_id}~${eventData.AddQuickEmoticon.room_id}`,
            elements: [
              h("quote", { id: eventData.AddQuickEmoticon.msg_uid.toString() }),
            ],
            guildId: eventData.AddQuickEmoticon.villa_id.toString(),
            messageId: `${eventData.AddQuickEmoticon.msg_uid}:0`,
            timestamp: new Date().getTime(),
          },
          timestamp: new Date().getTime(),
          userId: eventData.AddQuickEmoticon.uid.toString(),
        });
        logger.info(
          `Receive reaction '${eventData.AddQuickEmoticon.emoticon}' on message ${eventData.AddQuickEmoticon.msg_uid}`
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.AuditCallback:
        // todo
        break;
      default:
        ctx.body = defineStruct<Callback.Response>({
          message: "Unknown event",
          retcode: -1,
        });
        ctx.status = 400;
    }
  }

  public override getGuildMember(
    guildId: string,
    userId: string
  ): Promise<Universal.GuildMember> {
    return this.getUser(userId, guildId);
  }

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
