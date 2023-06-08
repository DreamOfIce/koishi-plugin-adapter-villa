import type { Room } from "../structs";
import type { VillaResponse } from "../types";

export namespace getRoom {
  export interface Params {
    room_id: string;
  }
  export type Response = VillaResponse<{ room: Room.Room }>;
}
