import type { Message } from "../message";
import type { VillaResponse } from "./response";

export namespace SendMessage {
  export interface Request {
    room_id: number;
    object_name: Message.MessageType;
    /** serialized string of @see {@link Message.MsgContentInfo} */
    msg_content: string;
  }

  export type Response = VillaResponse<{
    bot_msg_id: string;
  }>;
}
