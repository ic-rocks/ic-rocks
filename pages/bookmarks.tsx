import { useAtomValue } from "jotai/utils";
import Link from "next/link";
import React, { useMemo } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { MetaTags } from "../components/MetaTags";
import { Table } from "../components/Tables/Table";
import useTags from "../lib/hooks/useTags";
import { authAtom } from "../state/auth";

const Bookmarks = () => {
  const auth = useAtomValue(authAtom);
  const { data: tags } = useTags();

  const publicColumns = useMemo(
    () => [
      {
        Header: "Label",
        accessor: "label",
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: "Identifier",
        id: "id",
        Cell: ({ row }) => {
          const id = row.original.principalId || row.original.accountId;
          return (
            <Link
              href={`/${
                row.original.principalId ? "principal" : "account"
              }/${id}`}
            >
              <a className="link-overflow">{id}</a>
            </Link>
          );
        },
        className: "px-2 flex-2 flex oneline",
      },
    ],
    []
  );

  const privateColumns = useMemo(
    () => [
      {
        Header: "",
        accessor: "bookmarked",
        Cell: ({ value }) =>
          value ? (
            <FaBookmark className="h-3" />
          ) : (
            <FaRegBookmark className="h-3" />
          ),
        className: "px-2 w-8 flex items-center",
      },
      {
        Header: "Label",
        accessor: "label",
        Cell: ({ value }) =>
          value || <span className="text-gray-500">Not set</span>,
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: "Identifier",
        id: "id",
        Cell: ({ row }) => {
          const id = row.original.principalId || row.original.accountId;
          return (
            <Link
              href={`/${
                row.original.principalId ? "principal" : "account"
              }/${id}`}
            >
              <a className="link-overflow">{id}</a>
            </Link>
          );
        },
        className: "px-2 flex-1 flex oneline",
      },
      {
        Header: "Note",
        accessor: "note",
        className: "px-2 flex-1 hidden xs:block",
      },
      // {
      //   Header: "",
      //   id: "button",
      //   Cell: ({ value, row }) => <BiPencil />,
      //   className: "px-2 w-8 flex items-center",
      // },
    ],
    []
  );

  const initialSort = useMemo(() => [{ id: "label", desc: false }], []);

  return (
    <div className="pb-16">
      <MetaTags
        title="Bookmarks"
        description="Manage your bookmarks and tags."
      />
      {auth ? (
        <>
          <h2 className="mt-8 mb-4 text-2xl">Private Bookmarks</h2>
          {tags.private.length > 0 ? (
            <>
              <p className="mb-4">
                These are your private bookmarks, tags, and notes.
              </p>
              <Table
                name="bookmarks.private"
                data={tags.private}
                columns={privateColumns}
                count={tags.private.length}
                initialSortBy={initialSort}
                manualSortBy={false}
                usePage={false}
              />
            </>
          ) : (
            <p>You have not saved any bookmarks yet.</p>
          )}
          <h2 className="mt-12 mb-4 text-2xl">Public Labels</h2>
          {tags.public.length > 0 ? (
            <>
              <p className="mb-4">
                This is public data that you have contributed.
              </p>
              <Table
                name="bookmarks.public"
                data={tags.public}
                columns={publicColumns}
                count={tags.public.length}
                initialSortBy={initialSort}
                manualSortBy={false}
                usePage={false}
              />
            </>
          ) : (
            <p>You have not contributed any public data yet.</p>
          )}
        </>
      ) : (
        <p className="my-16">
          Log in to see your data contributions and bookmarks.
        </p>
      )}
    </div>
  );
};

export default Bookmarks;
