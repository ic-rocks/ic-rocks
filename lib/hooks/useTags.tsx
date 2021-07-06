import { useAtom } from "jotai";
import { useQuery } from "react-query";
import { authAtom } from "../../state/auth";
import { fetchAuthed } from "../fetch";
import { UserTags } from "../types/API";

export default function useTags() {
  const [auth] = useAtom(authAtom);
  return useQuery<UserTags>("tags", () => fetchAuthed("/api/user/tags", auth), {
    staleTime: Infinity,
    enabled: !!auth,
    initialData: {
      private: [],
      public: [],
    },
  });
}
