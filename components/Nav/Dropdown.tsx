import { CustomIdentity, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Menu, Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import React, { Fragment, useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { agentAtom, authAtom } from "../../state/auth";
import DarkModeToggle from "./DarkModeToggle";

export default function Dropdown() {
  const [principal, setPrincipal] = useState(null);
  const [_agent, setAgent] = useAtom(agentAtom);
  const [_auth, setAuth] = useAtom(authAtom);
  const resetAgent = useResetAtom(agentAtom);
  const resetAuth = useResetAtom(authAtom);
  const [authClient, setAuthClient] = useState<AuthClient>(null);

  const handleAuthenticated = async (authClient: AuthClient) => {
    const identity: CustomIdentity = authClient.getIdentity();

    const agent = new HttpAgent({ identity, host: "https://ic0.app" });
    setAgent(agent);

    const principal = await agent.getPrincipal();
    const principalId = principal.toHex().toLowerCase();
    const signature = (await identity.sign(principal.toUint8Array())).toString(
      "hex"
    );
    const publicKey = identity._inner._publicKey.rawKey.toString("hex");

    setAuth(`${principalId}.${signature}.${publicKey}`);

    setPrincipal(principal);
  };

  const handleLogin = () =>
    authClient.login({
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1e9), // one week
      onSuccess: () => handleAuthenticated(authClient),
    });

  const handleLogout = async () => {
    await authClient.logout();
    resetAgent();
    resetAuth();
    setPrincipal(null);
  };

  useEffect(() => {
    (async () => {
      const authClient = await AuthClient.create();
      setAuthClient(authClient);
      if (await authClient.isAuthenticated()) {
        handleAuthenticated(authClient);
      }
    })();
  }, []);

  return (
    <div className="flex flex-1 xs:flex-none h-full">
      <Menu as="div" className="relative flex-1">
        <div className="w-full h-full">
          <Menu.Button className="inline-flex justify-between items-center py-1 px-2 w-full h-full focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus:outline-none btn-default">
            {!!principal && (
              <span className="mr-2">
                User {principal.toText().split("-")[0]}
              </span>
            )}
            <FiMenu />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute xs:right-0 mt-2 w-32 bg-gray-100 dark:bg-gray-800 rounded-md divide-y ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none divide-default">
            <div className="py-1 px-1">
              <Menu.Item>
                <DarkModeToggle className="flex p-1 w-full text-sm btn-default" />
              </Menu.Item>
            </div>
            <div className="py-1 px-1">
              <Menu.Item>
                <button
                  className="flex items-center p-1 w-full text-sm btn-default"
                  onClick={principal ? handleLogout : handleLogin}
                >
                  <img src="/img/dfinity.png" className="mr-2 w-4" />
                  {principal ? "Logout" : "Login"}
                </button>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
