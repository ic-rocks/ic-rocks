import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { HiCheckCircle } from "react-icons/hi";
import useAutoToggle from "../../lib/hooks/useAutoToggle";
import {
  Action,
  useMutateTagsPrivate,
  useMutateTagsPublic,
} from "../../lib/hooks/useMutateTags";
import useTags from "../../lib/hooks/useTags";
import { LabelTag, Tag } from "../../lib/types/API";
import { authAtom } from "../../state/auth";
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
  const { data: tags } = useTags();

  const [myPrivateTag, setMyPrivateTag] = useState(null);
  const [myPublicTag, setMyPublicTag] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    if (!tags) return;

    const privateTag = tags.private.find(matchTag);
    if (privateTag) {
      setBookmarked(privateTag.bookmarked);
    } else {
      setBookmarked(false);
    }
    setMyPrivateTag(privateTag);

    const publicTag = tags.public.find(matchTag);
    setMyPublicTag(publicTag);
  }, [tags]);

  const mutatePrivate = useMutateTagsPrivate({
    account,
    principal,
  });

  return (
    <>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={openModal}
          className="py-1 px-2 text-xs focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus:outline-none btn-default-2"
        >
          Manage Tags
        </button>
        {!!auth && (
          <button
            onClick={() =>
              mutatePrivate.mutate({
                bookmarked: !bookmarked,
                action: "update",
              })
            }
            className="py-1 px-2 text-xs focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus:outline-none btn-default-2"
          >
            {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        )}
      </div>
      <Modal isOpen={isOpen} openModal={openModal} closeModal={closeModal}>
        <div className="divide-y divide-default">
          <PublicForm
            account={account}
            principal={principal}
            myTag={myPublicTag}
            name={name}
            publicTags={publicTags}
          />
          {auth ? (
            <PrivateForm
              account={account}
              principal={principal}
              myTag={myPrivateTag}
            />
          ) : (
            <p className="py-4 text-xs text-gray-500">
              Please log in to use bookmarks, labels, and notes.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

function PublicForm({
  account,
  principal,
  myTag,
  name,
  publicTags,
}: {
  account?: string;
  principal?: string;
  myTag: Tag;
  name: string;
  publicTags: LabelTag[];
}) {
  const [auth] = useAtom(authAtom);
  const [label, setLabel] = useState("");
  const { mutate, isLoading } = useMutateTagsPublic({ account, principal });
  const [isChecked, setIsChecked] = useAutoToggle();
  const action = useRef<Action>();

  useEffect(() => {
    if (myTag) {
      setLabel(myTag.label);
    } else {
      setLabel("");
    }
  }, [myTag]);

  function handleSubmitPublic(e) {
    e.preventDefault();
    action.current = "update";
    mutate(
      { action: action.current, label },
      {
        onSuccess: () => {
          setIsChecked(true);
        },
      }
    );
  }

  const handleDelete = () => {
    action.current = "delete";
    mutate({ action: action.current });
  };

  return (
    <form onSubmit={handleSubmitPublic}>
      <div className="flex flex-col gap-4 py-4">
        <div>
          <Label>Public Label</Label>
          {!!auth && (
            <input
              type="text"
              placeholder="Submit Public Label..."
              className="py-1 px-2 w-full text-sm bg-gray-200 dark:bg-gray-700"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={40}
            />
          )}
        </div>
        <ul className="text-sm">
          {!!name && (
            <li className="flex items-center">
              <div className="flex justify-end mr-2 w-6">
                <HiCheckCircle className="text-green-400" />
              </div>
              {name}
            </li>
          )}
          {publicTags.map((tag, i) => {
            return (
              <li key={i} className="flex">
                <div className="mr-2 w-6 text-right">{tag.count}</div>
                {tag.label}
              </li>
            );
          })}
        </ul>
        {!!auth && (
          <div className="flex gap-2">
            <CheckButton
              isLoading={isLoading && action.current === "update"}
              isChecked={isChecked}
              className="py-1 px-2 w-16 text-center btn-default-2"
            >
              Save
            </CheckButton>
            {!!myTag && (
              <SpinnerButton
                isLoading={isLoading && action.current === "delete"}
                className="py-1 w-16 text-center text-red-500 btn-default-2"
                onClick={handleDelete}
              >
                Delete
              </SpinnerButton>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

function PrivateForm({
  account,
  principal,
  myTag,
}: {
  account?: string;
  principal?: string;
  myTag: Tag;
}) {
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const { mutate, isLoading } = useMutateTagsPrivate({ account, principal });
  const [isChecked, setIsChecked] = useAutoToggle();
  const action = useRef<Action>();

  useEffect(() => {
    if (myTag) {
      setLabel(myTag.label);
      setNote(myTag.note);
    } else {
      setLabel("");
      setNote("");
    }
  }, [myTag]);

  function handleSubmit(e) {
    e.preventDefault();
    action.current = "update";
    mutate(
      { action: action.current, label, note },
      {
        onSuccess: () => {
          setIsChecked(true);
        },
      }
    );
  }

  const handleDelete = () => {
    action.current = "delete";
    mutate({ action: action.current });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 py-4">
        <div>
          <Label>Private Label</Label>
          <input
            type="text"
            placeholder="Private Label"
            className="py-1 px-2 w-full text-sm bg-gray-200 dark:bg-gray-700"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={40}
          />
          <p className="mt-1 text-xs text-gray-500">
            Private Labels (up to 40 characters) can be used for personal
            identification of Principals and Accounts
          </p>
        </div>

        <div>
          <Label>Private Note</Label>
          <textarea
            className="py-1 px-2 w-full text-sm bg-gray-200 dark:bg-gray-700"
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
            isLoading={isLoading && action.current === "update"}
            isChecked={isChecked}
            className="py-1 px-2 w-16 text-center btn-default-2"
          >
            Save
          </CheckButton>
          {!!myTag && (
            <SpinnerButton
              isLoading={isLoading && action.current === "delete"}
              className="py-1 w-16 text-center text-red-500 btn-default-2"
              onClick={handleDelete}
            >
              Delete
            </SpinnerButton>
          )}
        </div>
      </div>
    </form>
  );
}
