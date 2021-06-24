import React from "react";
import { FiExternalLink } from "react-icons/fi";
import { isUrl } from "../../lib/strings";

export const ProposalUrl = ({ url }: { url: string }) => {
  return isUrl(url) ? (
    <a
      href={url}
      target="_blank"
      className="inline-flex items-center oneline link-overflow"
    >
      {url} <FiExternalLink className="ml-1" />
    </a>
  ) : (
    <>{url}</>
  );
};
