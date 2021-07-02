import { useAtom } from "jotai";
import Link from "next/link";
import React from "react";
import { userTagAtom } from "../../state/tags";
import { TaggedLabel } from "./TaggedLabel";

const PrincipalLink = ({
  principalId,
  name,
  isLink = true,
}: {
  principalId: string;
  name?: string;
  isLink?: boolean;
}) => {
  const [allTags] = useAtom(userTagAtom);
  const tags = principalId
    ? allTags.private
        .filter((t) => t.principalId === principalId)
        .concat(allTags.public.filter((t) => t.principalId === principalId))
    : [];

  const label = tags[0] ? (
    <TaggedLabel label={tags[0].label} />
  ) : (
    name || principalId
  );

  return isLink ? (
    <Link href={`/principal/${principalId}`}>
      <a className="link-overflow">{label}</a>
    </Link>
  ) : (
    <span className="overflow-hidden overflow-ellipsis">{label}</span>
  );
};

export default PrincipalLink;
