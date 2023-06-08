import type { Group, VillaResponse } from "../structs";

export namespace getRoomList {
  export type Response = VillaResponse<{ list: Group.GroupRoom[] }>;
}
