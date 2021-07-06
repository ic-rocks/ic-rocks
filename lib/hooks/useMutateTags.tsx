import { useAtom } from "jotai";
import { del, set } from "object-path-immutable";
import { useMutation, useQueryClient } from "react-query";
import { authAtom } from "../../state/auth";
import { fetchAuthed } from "../fetch";
import { Tag, UserTags } from "../types/API";

export type Action = "update" | "delete";

const mergeTags = ({
  account,
  principal,
  data,
  previousTags,
  type,
}: {
  account?: string;
  principal?: string;
  data: Tag | { deleted: boolean };
  previousTags: UserTags;
  type: "private" | "public";
}): UserTags => {
  const matchTag = (tag) =>
    (!!account && tag.accountId === account) ||
    (!!principal && tag.principalId === principal);
  let newState = previousTags[type];
  const idx = previousTags[type].findIndex(matchTag);

  if ("deleted" in data) {
    newState = del(previousTags[type], [idx]);
  } else {
    if (idx >= 0) {
      newState = set(previousTags[type], [idx], data);
    } else {
      newState = previousTags[type].concat(data);
    }
  }
  return {
    ...previousTags,
    [type]: newState,
  };
};

export function useMutateTagsPrivate({ account, principal }) {
  const queryClient = useQueryClient();
  const [auth] = useAtom(authAtom);
  return useMutation(
    ({
      action,
      label,
      note,
      bookmarked,
    }: {
      action: Action;
      label?: string;
      note?: string;
      bookmarked?: boolean;
    }) =>
      fetchAuthed(`/api/user/tags/private`, auth, {
        method: "POST",
        body: JSON.stringify({
          action,
          account,
          principal,
          label,
          note,
          bookmarked,
        }),
      }),
    {
      onSuccess: (data) => {
        const previousTags = queryClient.getQueryData<UserTags>("tags");
        queryClient.setQueryData(
          "tags",
          mergeTags({ account, principal, data, previousTags, type: "private" })
        );
      },
    }
  );
}

export function useMutateTagsPublic({ account, principal }) {
  const queryClient = useQueryClient();
  const [auth] = useAtom(authAtom);
  return useMutation(
    ({ action, label }: { action: Action; label?: string }) =>
      fetchAuthed(`/api/user/tags/public`, auth, {
        method: "POST",
        body: JSON.stringify({
          action,
          account,
          principal,
          label,
        }),
      }),
    {
      onSuccess: (data) => {
        const previousTags = queryClient.getQueryData<UserTags>("tags");
        queryClient.setQueryData(
          "tags",
          mergeTags({ account, principal, data, previousTags, type: "public" })
        );
      },
    }
  );
}
