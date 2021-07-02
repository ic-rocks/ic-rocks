import { Dialog, Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { set } from "object-path-immutable";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { HiCheckCircle } from "react-icons/hi";
import { fetchAuthed } from "../../lib/fetch";
import { LabelTag } from "../../lib/types/API";
import { authAtom } from "../../state/auth";
import { userTagAtom } from "../../state/tags";
import { Label } from "../Forms/Label";

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
  const [label, setLabel] = useState("");
  const [publicLabel, setPublicLabel] = useState("");
  const [note, setNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const cancelButtonRef = useRef();

  useEffect(() => {
    if (tags?.private.length > 0) {
      const privateTag = tags.private.find(matchTag);
      if (privateTag && !label) {
        setLabel(privateTag.label);
      }
    }
    if (tags?.public.length > 0) {
      const publicTag = tags.public.find(matchTag);
      if (publicTag && !label) {
        setPublicLabel(publicTag.label);
      }
    }
  }, [tags]);

  function handleSubmit(e) {
    e.preventDefault();

    if (auth) {
      (async () => {
        try {
          const res = await fetchAuthed("/api/user/tags", auth, {
            method: "POST",
            body: JSON.stringify({
              action: "update",
              account,
              principal,
              publicLabel,
              label,
              note,
            }),
          });
          if (res) {
            console.log(res);
            setTags((prev) => {
              let newPrivate = prev.private;
              if (res.private) {
                const idx = prev.private.findIndex(matchTag);
                if (idx > 0) {
                  newPrivate = set(prev.private, [idx], res.private);
                } else {
                  newPrivate = prev.private.concat(res.private);
                }
              }
              let newPublic = prev.public;
              if (res.public) {
                const idx = prev.public.findIndex(matchTag);
                if (idx > 0) {
                  newPublic = set(prev.public, [idx], res.public);
                } else {
                  newPublic = prev.public.concat(res.public);
                }
              }

              const after = {
                private: newPrivate,
                public: newPublic,
              };
              return after;
            });
          }
        } catch (error) {
          console.warn(error.message);
        }
      })();
    }

    closeModal();
  }

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs px-2 py-1 btn-default-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Manage Tags
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto backdrop-filter backdrop-brightness-50"
          onClose={closeModal}
          initialFocus={cancelButtonRef}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-sm p-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-100 dark:bg-gray-800 shadow-xl rounded-2xl">
                <div className="flex justify-between">
                  <Dialog.Title as="h3" className="text-lg leading-tight">
                    Manage Tags
                  </Dialog.Title>
                  <button
                    type="button"
                    className="btn-default p-1"
                    onClick={closeModal}
                    ref={cancelButtonRef}
                  >
                    <FaTimes />
                  </button>
                </div>
                {auth ? (
                  <form
                    onSubmit={handleSubmit}
                    className="divide-y divide-default"
                  >
                    <div className="py-4 flex flex-col gap-4">
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
                              <div className="w-6 text-right mr-2">
                                {tag.count}
                              </div>
                              {tag.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="py-4 flex flex-col gap-4">
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
                          <strong>DO NOT</strong> store private keys or
                          passwords here
                        </p>
                      </div>
                    </div>

                    <div className="py-4">
                      <button type="submit" className="btn-default-2 px-2 py-1">
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Please log in to use labels and notes
                  </p>
                )}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
