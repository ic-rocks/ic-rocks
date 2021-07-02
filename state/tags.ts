import { atomWithReset } from "jotai/utils";
import { UserTags } from "../lib/types/API";

export const userTagAtom = atomWithReset<UserTags>({
  private: [],
  public: [],
});
