import {
  Bot,
  type Context,
  type Fragment,
  Quester,
  type SendOptions,
  type Universal,
} from "koishi";
import { VillaBot as VillaBotConfig } from "./config";
import {
  createAxios,
  defineStruct,
  getUser,
  logger,
  registerCallbackRoute,
  removeCallbackRoute,
} from "./utils";
import type { KoaContext } from "./types";
import { Callback } from "./structs";
import { VillaMessanger } from "./messanger";
// import { parseMessage } from "./utils/parseMessage";

export class VillaBot extends Bot<VillaBotConfig.Config> {
  /** bot id */
  protected id: string;
  /** bot secret */
  protected secret: string;
  /** */
  protected description = "";

  /** axios instance with auth header */
  public axios: Quester;

  public constructor(ctx: Context, config: VillaBotConfig.Config) {
    super(ctx, config);

    this.id = config.id;
    this.secret = config.secret;
    this.selfId = config.id;

    this.axios = createAxios(ctx, config.id, config.secret);
  }

  public onError(error: Error) {
    logger.error(error);
  }

  public override async start(): Promise<void> {
    await super.start();
    registerCallbackRoute(this.ctx, this.id, this.handleCallback.bind(this));
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
        logger.debug(
          `New member of villa ${body.event.robot.villa_id}: ${eventData.JoinVilla.join_uid}`
        );
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.SendMessage: {
        const msg = JSON.parse(
          eventData.SendMessage.content
        ) as Callback.MsgContentInfo;
        const session = super.session({
          author: {
            username: eventData.SendMessage.nickname,
            nickname: eventData.SendMessage.nickname,
            userId: eventData.SendMessage.from_user_id.toString(),
            avatar: msg.user.portraitUri,
          },
          type: "message",
          subtype: "group",
          channelId: eventData.SendMessage.room_id.toString(),
          content: msg.content.text,
          // elements: parseMessage(msg),
          guildId: body.event.robot.villa_id.toString(),
          messageId: eventData.SendMessage.msg_uid,
          timestamp: eventData.SendMessage.send_at,
          userId: eventData.SendMessage.from_user_id.toString(),
        });
        logger.info(`Receive message '${session.content}'.`);
        this.dispatch(session);
        break;
      }
      case Callback.RobotEventType.CreateRobot:
        // todo
        break;
      case Callback.RobotEventType.DeleteRobot:
        // todo
        break;
      case Callback.RobotEventType.AddQuickEmoticon:
        // todo
        break;
      case Callback.RobotEventType.AuditCallback:
      default:
        ctx.body = defineStruct<Callback.Response>({
          message: "Unknown event",
          retcode: -1,
        });
        ctx.status = 400;
    }
  }

  public override getUser = getUser;
  public override platform = "villa";
}

export * from "./config";
