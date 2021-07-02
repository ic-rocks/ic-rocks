import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useEffect } from "react";
import { authAtom } from "../../state/auth";
import { userTagAtom } from "../../state/tags";
import { fetchAuthed } from "../fetch";

export default function useAuth() {
  const [auth] = useAtom(authAtom);
  const [_tags, setTags] = useAtom(userTagAtom);
  const resetTags = useResetAtom(userTagAtom);

  useEffect(() => {
    console.log({ auth });

    if (auth) {
      (async () => {
        const tags = await fetchAuthed("/api/user/tags", auth);
        console.log({ tags });

        setTags(tags);
      })();
    } else {
      resetTags();
    }
  }, [auth]);

  return null;
}
