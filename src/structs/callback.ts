import type { Command } from "./command";
import type { Message } from "./message";

export namespace Callback {
  export interface Request {
    event: RobotEvent;
  }

  export interface RobotEvent {
    robot: {
      template: {
        id: string;
        name: string;
        desc: string;
        icon: string;
        commands: Command.Command[];
      };
      villa_id: number;
    };
    type: RobotEventType;
    created_at: number;
    send_at: number;
    extend_data: {
      EventData: EventData;
    };
  }

  export enum RobotEventType {
    JoinVilla = 1,
    SendMessage = 2,
    CreateRobot = 3,
    DeleteRobot = 4,
    AddQuickEmoticon = 5,
    AuditCallback = 6,
  }

  /**
   * NOTE: In fact only the item corresponding to event.type is not empty
   * @see https://webstatic.mihoyo.com/vila/bot/doc/callback.html
   */
  export interface EventData {
    JoinVilla: {
      join_uid: number;
      join_user_nickname: string;
      join_at: number;
    };
    SendMessage: {
      /** serialized string of @see {@link MsgContentInfo} */
      content: string;
      from_user_id: number;
      send_at: number;
      room_id: number;
      object_name: MessageNumberType;
      nickname: string;
      msg_uid: string;
      bot_msg_id: string;
    };
    CreateRobot: {
      villa_id: number;
    };
    DeleteRobot: {
      villa_id: number;
    };
    AddQuickEmoticon: {
      villa_id: number;
      room_id: number;
      uid: number;
      emoticon_id: number;
      emoticon: string;
      msg_uid: string;
      bot_msg_id: string;
      is_cancel: boolean;
    };
    AuditCallback: {
      audit_id: string;
      bot_tpl_id: string;
      villa_id: number;
      room_id: number;
      user_id: number;
      pass_through: string;
      audit_result: 0 | 1 | 2;
    };
  }

  export enum MessageNumberType {
    text = 1,
    image = 2,
  }

  export interface MsgContentInfo<
    T extends Message.MsgContent = Message.MsgContent
  > extends Message.MsgContentInfo<T> {
    user: {
      /** avatar url */
      portraitUri: string;
      extra: string;
      name: string;
      alias: string;
      id: string;
      /** avatar url */
      portrait: string;
    };
  }
  export interface Response {
    message: string;
    retcode: number;
  }
}
