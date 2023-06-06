import type { VillaResponse } from "./response";

export namespace Room {
  export interface Params {
    room_id: string;
  }

  export interface Room {
    room_id: string;
    room_name: string;
    room_type: RoomType;
    group_id: string;
    room_default_notify_type: RoomNotifyType;
    send_msg_auth_range: SendMsgAuthRange;
  }
  export enum RoomType {
    chat = "BOT_PLATFORM_ROOM_TYPE_CHAT_ROOM",
    post = "BOT_PLATFORM_ROOM_TYPE_POST_ROOM",
    scene = "BOT_PLATFORM_ROOM_TYPE_SCENE_ROOM",
    invaild = "BOT_PLATFORM_ROOM_TYPE_INVALID",
  }
  export enum RoomNotifyType {
    notify = "BOT_PLATFORM_DEFAULT_NOTIFY_TYPE_NOTIFY",
    ignore = "BOT_PLATFORM_DEFAULT_NOTIFY_TYPE_IGNORE",
    invaild = "BOT_PLATFORM_DEFAULT_NOTIFY_TYPE_INVALID",
  }

  export interface SendMsgAuthRange {
    is_all_send_msg: boolean;
    roles: string[];
  }
  export type Response = VillaResponse<{ room: Room.Room }>;
}
