import { VillaResponse } from "./response";

export namespace GetUploadImageParams {
  export interface Params {
    md5: string;
    ext: string;
  }

  export type Response = VillaResponse<{
    type: string;
    file_name: string;
    max_file_size: string;
    params: {
      accessid: string;
      callback: string;
      callback_var: {
        "x:extra": string;
      };
      dir: string;
      expire: string;
      host: string;
      name: string;
      policy: string;
      signature: string;
      x_oss_content_type: string;
      object_acl: string;
      content_disposition: string;
      key: string;
      success_action_status: string;
    };
  }>;
}
