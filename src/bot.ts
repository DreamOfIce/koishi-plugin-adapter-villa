import { Bot, Quester, type Context } from "koishi";
import { VillaBot as VillaBotConfig } from "./config";
import {
  createAxios,
  defineStruct,
  getUser,
  logger,
  registerCallbackRoute,
  removeCallbackRoute,
  sendMessage,
} from "./utils";
import type { KoaContext } from "./types";
import { Callback } from "./structs";

export class VillaBot extends Bot<VillaBotConfig.Config> {
  /** bot id */
  protected id: string;
  /** bot secret */
  protected secret: string;
  /** axios instance with auth header */
  protected axios: Quester;

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

  protected async handleCallback(ctx: KoaContext) {
    const { body } = ctx.request;
    if (!body) {
      ctx.body = defineStruct<Callback.Response>({
        message: "Receive empty body",
        retcode: -1,
      });
      ctx.status = 400;
      return;
    }
    const eventData = body.event.extend_data.EventData;
    switch (body.event.type) {
      case Callback.RobotEventType.JoinVilla:
        // todo
        break;
      case Callback.RobotEventType.SendMessage: {
        const session = super.session({
          author: {
            username: eventData.SendMessage.nickname,
            nickname: eventData.SendMessage.nickname,
            userId: eventData.SendMessage.from_user_id.toString(),
          },
          type: "message",
          channelId: eventData.SendMessage.room_id.toString(),
          guildId: body.event.robot.villa_id.toString(),
          content: JSON.parse(eventData.SendMessage.content).content.text,
          messageId: eventData.SendMessage.msg_uid,
          timestamp: eventData.SendMessage.send_at,
        });
        logger.debug(`Receive message '${session.content}'.`);
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
  public override sendMessage = sendMessage;
}

export * from "./config";
