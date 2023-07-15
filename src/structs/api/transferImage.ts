import type { VillaResponse } from "./response";

export namespace TransferImage {
  export interface Request {
    url: string;
  }
  export type Response = VillaResponse<{
    new_url: string;
  }>;
}
