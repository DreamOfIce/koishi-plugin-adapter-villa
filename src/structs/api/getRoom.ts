import type { Room } from "..";
import type { VillaResponse } from "../../types";

export namespace GetRoom {
  export interface Params {
    room_id: string;
  }
  export type Response = VillaResponse<{ room: Room.Room }>;
}
