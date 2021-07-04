import { useAtom } from "jotai";
import { del, set } from "object-path-immutable";
import React, { useEffect, useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { HiCheckCircle } from "react-icons/hi";
import { fetchAuthed } from "../../lib/fetch";
import { LabelTag } from "../../lib/types/API";
import { authAtom } from "../../state/auth";
import { userTagAtom } from "../../state/tags";
import CheckButton from "../Forms/CheckButton";
import { Label } from "../Forms/Label";
import SpinnerButton from "../Forms/SpinnerButton";
import Modal from "./Modal";

type TagModalProps = {
  publicTags?: LabelTag[];
  name?: string;
  account?: string;
  principal?: string;
};

export default function TagModal({
  publicTags = [],
  name,
  account,
  principal,
}: TagModalProps) {
  const matchTag = (tag) =>
    (!!account && tag.accountId === account) ||
    (!!principal && tag.principalId === principal);

  const [auth] = useAtom(authAtom);
  const [tags, setTags] = useAtom(userTagAtom);
  const [isLoading, setIsLoading] = useState({ private: false, public: false });
  const [isChecked, setIsChecked] = useState({ private: false, public: false });
  const [isDeleting, setIsDeleting] = useState({
    private: false,
    public: false,
  });
  const [exists, setExists] = useState({
    private: false,
    public: false,
  });
  const [bookmarked, setBookmarked] = useState(false);
  const [label, setLabel] = useState("");
  const [publicLabel, setPublicLabel] = useState("");
  const [note, setNote] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    if (!tags) return;

    const privateTag = tags.private.find(matchTag);
    if (privateTag) {
      setBookmarked(privateTag.bookmarked);
      setLabel(privateTag.label);
      setExists((p) => ({ ...p, private: true }));
    } else {
      setBookmarked(false);
      setLabel("");
      setExists((p) => ({ ...p, private: false }));
    }

    const publicTag = tags.public.find(matchTag);
    if (publicTag) {
      setPublicLabel(publicTag.label);
      setExists((p) => ({ ...p, public: true }));
    } else {
      setPublicLabel("");
      setExists((p) => ({ ...p, public: false }));
    }
  }, [tags]);

  async function submit({
    type,
    publicLabel,
    label,
    note,
    bookmarked,
  }: {
    type: "private" | "public";
    publicLabel?: string;
    label?: string;
    note?: string;
    bookmarked?: boolean;
  }) {
    let res;
    const body =
      type === "private"
        ? {
            action: "update",
            account,
            principal,
            label,
            note,
            bookmarked,
          }
        : {
            action: "update",
            account,
            principal,
            label: publicLabel,
          };
    setIsLoading((prev) => ({ ...prev, [type]: true }));
    try {
      res = await fetchAuthed(`/api/user/tags/${type}`, auth, {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.warn(error.message);
    }
    setIsLoading((prev) => ({ ...prev, [type]: false }));
    if (!res) {
      return;
    }
    setIsChecked((prev) => ({ ...prev, [type]: true }));
    setTimeout(
      () => setIsChecked((prev) => ({ ...prev, [type]: false })),
      1000
    );

    console.log(res);
    setTags((prev) => {
      let newState = prev[type];
      const idx = prev[type].findIndex(matchTag);
      if (res.deleted) {
        newState = del(prev[type], [idx]);
      } else {
        if (idx >= 0) {
          newState = set(prev[type], [idx], res);
        } else {
          newState = prev[type].concat(res);
        }
      }

      return {
        ...prev,
        [type]: newState,
      };
    });
  }

  function handleSubmit(e, type) {
    e.preventDefault();

    if (auth) {
      submit({ type, publicLabel, label, note });
    }
  }

  const handleDelete = async (e, type) => {
    e.preventDefault();

    let res;
    setIsDeleting((prev) => ({ ...prev, [type]: true }));
    try {
      res = await fetchAuthed(`/api/user/tags/${type}`, auth, {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          account,
          principal,
        }),
      });
    } catch (error) {
      console.warn(error.message);
    }
    setIsDeleting((prev) => ({ ...prev, [type]: false }));
    if (!res) {
      return;
    }

    console.log(res);
    setTags((prev) => {
      let newState = prev[type];
      const idx = prev[type].findIndex(matchTag);
      if (res.deleted) {
        newState = del(prev[type], [idx]);
      }

      return {
        ...prev,
        [type]: newState,
      };
    });
    closeModal();
  };

  return (
    <>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={openModal}
          className="text-xs px-2 py-1 btn-default-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Manage Tags
        </button>
        {!!auth && (
          <button
            onClick={() => submit({ bookmarked: !bookmarked, type: "private" })}
            className="text-xs px-2 py-1 btn-default-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
          >
            {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        )}
      </div>
      <Modal isOpen={isOpen} openModal={openModal} closeModal={closeModal}>
        {auth ? (
          <div className="divide-y divide-default">
            <form onSubmit={(e) => handleSubmit(e, "public")}>
              <div className="flex flex-col gap-4 py-4">
                <div>
                  <Label>Public Label</Label>
                  <input
                    type="text"
                    placeholder="Submit Public Label..."
                    className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
                    value={publicLabel}
                    onChange={(e) => setPublicLabel(e.target.value)}
                    maxLength={40}
                  />
                </div>
                <ul className="text-sm">
                  {!!name && (
                    <li className="flex items-center">
                      <div className="w-6 flex justify-end mr-2">
                        <HiCheckCircle className="text-green-400" />
                      </div>
                      {name}
                    </li>
                  )}
                  {publicTags.map((tag, i) => {
                    return (
                      <li key={i} className="flex">
                        <div className="w-6 text-right mr-2">{tag.count}</div>
                        {tag.label}
                      </li>
                    );
                  })}
                </ul>
                <div className="flex gap-2">
                  <CheckButton
                    isLoading={isLoading.public}
                    isChecked={isChecked.public}
                    className="btn-default-2 px-2 py-1 text-center w-16"
                  >
                    Save
                  </CheckButton>
                  {exists.public && (
                    <SpinnerButton
                      isLoading={isDeleting.public}
                      className="btn-default-2 w-16 text-center py-1 text-red-500"
                      onClick={(e) => handleDelete(e, "public")}
                    >
                      Delete
                    </SpinnerButton>
                  )}
                </div>
              </div>
            </form>

            <form onSubmit={(e) => handleSubmit(e, "private")}>
              <div className="flex flex-col gap-4 py-4">
                <div>
                  <Label>Private Label</Label>
                  <input
                    type="text"
                    placeholder="Private Label"
                    className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    maxLength={40}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Private Labels (up to 40 characters) can be used for
                    personal identification of Principals and Accounts
                  </p>
                </div>

                <div>
                  <Label>Private Note</Label>
                  <textarea
                    className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
                    style={{ minHeight: "8rem" }}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <strong>DO NOT</strong> store private keys or passwords here
                  </p>
                </div>

                <div className="flex gap-2">
                  <CheckButton
                    isLoading={isLoading.private}
                    isChecked={isChecked.private}
                    className="btn-default-2 px-2 py-1 text-center w-16"
                  >
                    Save
                  </CheckButton>
                  {exists.private && (
                    <SpinnerButton
                      isLoading={isDeleting.private}
                      className="btn-default-2 w-16 text-center py-1 text-red-500"
                      onClick={(e) => handleDelete(e, "private")}
                    >
                      Delete
                    </SpinnerButton>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Please log in to use bookmarks, labels, and notes.
          </p>
        )}
      </Modal>
    </>
  );
}
