export interface Member {
  basic: MemberBasic;
  role_id_list: number[];
  joined_at: number;
}

export interface MemberBasic {
  uid: number;
  nickname: string;
  introduce: string;
  avatar: string;
}
