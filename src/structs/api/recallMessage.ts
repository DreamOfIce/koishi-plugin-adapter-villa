import type { VillaResponse } from "./response";

export namespace RecallMessage {
  export interface Request {
    msg_uid: string;
    room_id: string;
    msg_time: number;
  }
  export type Response = VillaResponse<Record<never, never>>;
}
