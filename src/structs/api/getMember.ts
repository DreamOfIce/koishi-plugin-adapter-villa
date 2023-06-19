import type { Member } from "../member";
import type { VillaResponse } from "./response";

export namespace GetMember {
  export interface Params {
    uid: string;
  }
  export type Response = VillaResponse<{
    basic: Member.MemberBasic;
    role_id_list: number[];
    joined_at: number;
  }>;
}
