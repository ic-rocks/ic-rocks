import { useAtom } from "jotai";
import Link from "next/link";
import React from "react";
import { userTagAtom } from "../../state/tags";
import { TaggedLabel } from "./TaggedLabel";

const AccountLink = ({
  accountId,
  name,
  isLink = true,
}: {
  accountId: string;
  name?: string;
  isLink?: boolean;
}) => {
  const [allTags] = useAtom(userTagAtom);
  const tags = accountId
    ? allTags.private
        .filter((t) => t.accountId === accountId)
        .concat(allTags.public.filter((t) => t.accountId === accountId))
    : [];

  const label = tags[0] ? (
    <TaggedLabel label={tags[0].label} />
  ) : (
    name || accountId
  );

  return isLink ? (
    <Link href={`/account/${accountId}`}>
      <a className="link-overflow">{label}</a>
    </Link>
  ) : (
    <span className="overflow-hidden overflow-ellipsis">{label}</span>
  );
};

export default AccountLink;
