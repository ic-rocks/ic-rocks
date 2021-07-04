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
    <div className="flex-1 xs:flex-none flex h-full">
      <Menu as="div" className="relative flex-1">
        <div className="w-full h-full">
          <Menu.Button className="w-full h-full inline-flex justify-between items-center px-2 py-1 btn-default focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
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
          <Menu.Items className="absolute xs:right-0 w-32 mt-2 origin-top-right bg-gray-100 dark:bg-gray-800 divide-y divide-default rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              <Menu.Item>
                <DarkModeToggle className="flex w-full p-1 text-sm btn-default" />
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                <button
                  className="flex items-center w-full p-1 text-sm btn-default"
                  onClick={principal ? handleLogout : handleLogin}
                >
                  <img src="/img/dfinity.png" className="w-4 mr-2" />
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
