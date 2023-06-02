export namespace Member {
  export interface Params {
    uid: string;
  }
  export interface Response {
    basic: MemberBasic;
    role_id_list: number[];
    joined_at: number;
  }

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
