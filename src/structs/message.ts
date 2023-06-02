export namespace Message {
  export interface Request {
    room_id: number;
    object_name: MessageType;
    /** serialized string of @see {@link MsgContentInfo} */
    msg_content: string;
  }

  export enum MessageType {
    text = "MHY:Text",
  }

  export interface MsgContentInfo {
    content: MsgContent;
    mentionedInfo?: MentionedInfo;
    quote?: QuoteInfo;
  }

  export type MentionedInfo =
    | {
        type: MentionedType.allMember;
      }
    | {
        type: MentionedType.partMemeber;
        userIdList: string[];
      };

  export enum MentionedType {
    /** all members */
    allMember = 1,
    /** some of the members */
    partMemeber = 2,
  }

  export interface QuoteInfo {
    quoted_message_id: string;
    quoted_message_send_time: string;
    /** same as quoted_message_id */
    original_message_id: string;
    /** same as quoted_message_send_time */
    original_message_send_time: string;
  }

  export type MsgContent = TextMsgContent;

  export interface TextMsgContent {
    text: string;
    entities: TextEntity[];
  }

  export interface TextEntity {
    offset: number;
    length: number;
    entity: Entity;
  }

  export type Entity =
    | Entities.MentionedRobotEntity
    | Entities.MentionedUserEntity
    | Entities.MentionedAllEntity
    | Entities.VillaRoomEntity
    | Entities.LinkEntity;

  export namespace Entities {
    export interface MentionedRobotEntity {
      type: "mentioned_robot";
      bot_id: string;
    }
    export interface MentionedUserEntity {
      type: "mentioned_user";
      user_id: number;
    }
    export interface MentionedAllEntity {
      type: "mentioned_all";
    }
    export interface VillaRoomEntity {
      type: "villa_room_link";
      villa_id: string;
      room_id: string;
    }
    export interface LinkEntity {
      type: "link";
      url: string;
    }
  }

  export interface Response {
    retcode: number;
    message: string;
    data: {
      bot_msg_id: string;
    };
  }
}
