import type { Emoticon } from "../emoticon";
import type { VillaResponse } from "./response";

export namespace getAllEmoticons {
  export type Response = VillaResponse<{ list: Emoticon.Emoticon[] }>;
}
