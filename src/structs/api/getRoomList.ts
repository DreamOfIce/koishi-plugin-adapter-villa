import type { Group } from "../group";
import type { VillaResponse } from "./response";

export namespace GetRoomList {
  export type Response = VillaResponse<{ list: Group.GroupRoom[] }>;
}
