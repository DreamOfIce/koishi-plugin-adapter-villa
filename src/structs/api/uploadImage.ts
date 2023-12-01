import { VillaResponse } from "./response";

export namespace UploadImage {
  export interface Request {
    callback: string;
    "Content-Disposition": string;
    key: string;
    name: string;
    OSSAccessKeyId: string;
    policy: string;
    signature: string;
    success_action_status: string;
    "x-oss-content-type": string;
    "x:extra": string;
    file: ArrayBuffer;
  }
  export type Response = VillaResponse<{
    url: string;
    secret_url: string;
    object: string;
  }>;
}
