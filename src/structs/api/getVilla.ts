import type { VillaResponse } from "./response";

export namespace GetVilla {
  export type Response = VillaResponse<{
    villa: {
      villa_id: number;
      name: string;
      villa_avatar_url: string;
      owner_uid: number;
      is_official: boolean;
      introduce: string;
      category_id: number;
      tags: string[];
    };
  }>;
}
