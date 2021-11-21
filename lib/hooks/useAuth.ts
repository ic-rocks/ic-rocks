import { useAtom } from "jotai";
import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { authAtom } from "../../state/auth";

export default function useAuth() {
  const [auth] = useAtom(authAtom);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auth) {
      queryClient.invalidateQueries("tags");
    }
  }, [auth, queryClient]);

  return null;
}
