import type { VillaResponse } from "../types";

export namespace Member {
  export interface Params {
    uid: string;
  }
  export type Response = VillaResponse<{
    basic: MemberBasic;
    role_id_list: number[];
    joined_at: number;
  }>;

  export interface MemberBasic {
    uid: number;
    nickname: string;
    introduce: string;
    /** avatar id */
    avatar: string;
    /** avatar url */
    avatar_url: string;
  }
}
