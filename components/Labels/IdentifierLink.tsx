import classNames from "classnames";
import Link from "next/link";
import React from "react";
import useTags from "../../lib/hooks/useTags";
import { TaggedLabel } from "./TaggedLabel";

const IdentifierLink = ({
  id,
  type,
  name,
  isLink = true,
  className,
}: {
  id: string;
  type: "account" | "principal";
  name?: string;
  isLink?: boolean;
  className?: string;
}) => {
  const { data: allTags } = useTags();
  const field = type === "account" ? "accountId" : "principalId";
  const tags = id
    ? allTags.private
        .filter((t) => t[field] === id)
        .concat(allTags.public.filter((t) => t[field] === id))
    : [];

  const label = tags[0]?.label ? (
    <TaggedLabel label={tags[0].label} />
  ) : (
    name || id
  );

  return isLink ? (
    <Link href={`/${type}/${id}`}>
      <a className={classNames(className, "link-overflow")}>{label}</a>
    </Link>
  ) : (
    <span className="overflow-hidden overflow-ellipsis">{label}</span>
  );
};

export default IdentifierLink;
