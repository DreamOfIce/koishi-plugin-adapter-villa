import type { Group, VillaResponse } from "..";

export namespace GetRoomList {
  export type Response = VillaResponse<{ list: Group.GroupRoom[] }>;
}
