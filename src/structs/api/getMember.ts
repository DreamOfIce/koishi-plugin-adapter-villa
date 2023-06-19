import type { Member } from "../member";
import type { VillaResponse } from "./response";

export namespace GetMember {
  export interface Params {
    uid: string;
  }
  export type Response = VillaResponse<Member.Member>;
}
