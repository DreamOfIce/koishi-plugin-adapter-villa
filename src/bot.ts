import { Bot, type Context} from "koishi";
import { VillaBot as VillaBotConfig } from "./config";
import {
  getUser,
  logger,
  registerCallbackRoute,
  removeCallbackRoute,
} from "./utils";
import type { KoaContext } from "./types";
import { RobotEventType, defineCallbackResponse } from "./structs";

export class VillaBot extends Bot<VillaBotConfig.Config> {
  public id: string;
  protected secret: string;
  public constructor(ctx: Context, config: VillaBotConfig.Config) {
    super(ctx, config);
    this.id = config.id;
    this.secret = config.secret;
    this.selfId = config.id;
    registerCallbackRoute(this.ctx, this.id, this.handleCallback.bind(this));
  }

  public onError(error: Error) {
    logger.error(error);
  }

  public override async start(): Promise<void> {}
  public override async stop(): Promise<void> {
    removeCallbackRoute(this.id);
  }

  protected async handleCallback(ctx: KoaContext) {
    const { body } = ctx.request;
    if (!body) {
      ctx.body = defineCallbackResponse({
        message: "Receive empty body",
        retcode: -1,
      });
      ctx.status = 400;
      return;
    }
    const eventData = body.event.extend_data.EventData;
    switch (body.event.type) {
      case RobotEventType.JoinVilla:
        // todo
        break;
      case RobotEventType.SendMessage: {
        const session = super.session({
          author: {
            username: eventData.SendMessage.nickname,
            nickname: eventData.SendMessage.nickname,
            userId: eventData.SendMessage.from_user_id.toString(),
          },
          channelId: eventData.SendMessage.room_id.toString(),
          guildId: body.event.robot.villa_id.toString(),
          content: eventData.SendMessage.content,
          userId: eventData.SendMessage.from_user_id.toString(),
          messageId: eventData.SendMessage.msg_uid,
          timestamp: eventData.SendMessage.send_at,
        });
        this.dispatch(session);
        break;
      }
      case RobotEventType.CreateRobot:
        // todo
        break;
      case RobotEventType.DeleteRobot:
        // todo
        break;
      case RobotEventType.AddQuickEmoticon:
        // todo
        break;
      case RobotEventType.AuditCallback:
      default:
        ctx.body = defineCallbackResponse({
          message: "Unknown event",
          retcode: -1,
        });
        ctx.status = 400;
    }
  }
  public override getUser = getUser;
}

export * from "./config";
