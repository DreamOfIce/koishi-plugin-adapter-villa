export namespace Message {
  export enum MessageType {
    text = "MHY:Text",
    image = "MHY:Image",
    post = "MHY:Post",
  }

  export enum MessageNumberType {
    text = 1,
    image = 2,
    post = 3,
  }

  export interface MsgContentInfo<T extends MsgContent = MsgContent> {
    content: T;
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
    quoted_message_send_time: number;
    /** same as quoted_message_id */
    original_message_id: string;
    /** same as quoted_message_send_time */
    original_message_send_time: number;
  }

  export type MsgContent = TextMsgContent | ImageMsgContent | PostMsgContent;

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
    | TextEntities.MentionedRobotEntity
    | TextEntities.MentionedUserEntity
    | TextEntities.MentionedAllEntity
    | TextEntities.VillaRoomEntity
    | TextEntities.LinkEntity;

  export namespace TextEntities {
    export interface MentionedRobotEntity {
      type: "mentioned_robot";
      bot_id: string;
    }
    export interface MentionedUserEntity {
      type: "mentioned_user";
      user_id: string;
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

  export interface ImageMsgContent {
    url: string;
    size?: {
      width: number;
      height: number;
    };
    file_size?: number;
  }

  export interface PostMsgContent {
    post_id: string;
  }
}
