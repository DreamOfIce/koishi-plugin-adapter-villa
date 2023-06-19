import type { Member } from "../member";
import type { VillaResponse } from "./response";

export namespace GetVillaMembers {
  export interface Params {
    offset_str: string;
    size: string;
  }

  export type Response = VillaResponse<{
    list: Member.Member[];
    next_offset_str: string;
  }>;
}
