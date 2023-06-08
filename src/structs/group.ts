import { Room } from "./room";
export namespace Group {
  export interface Group {
    group_id: string;
    group_name: string;
  }

  export interface GroupRoom extends Group {
    room_list: ListRoom[];
  }

  export interface ListRoom {
    room_id: string;
    room_name: string;
    room_type: Room.RoomType;
  }
}
