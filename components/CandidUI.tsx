import { Actor, HttpAgent, IDL } from "@dfinity/agent";
import classNames from "classnames";
import { del, set } from "object-path-immutable";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { BsArrowReturnRight } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { FiExternalLink } from "react-icons/fi";
import { any, getShortname, validate } from "../lib/candid/utils";
import { Bindings } from "../lib/didc-js/didc_js";
import { DELETE_ITEM, Input, Output, OUTPUT_DISPLAYS } from "./candid/Elements";

const CANDID_UI_URL = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/";
const agent = new HttpAgent({ host: "https://ic0.app" });

export type Type = "loading" | "input" | "output" | "error" | "outputDisplay";

function reducer(
  state,
  {
    type,
    func,
    payload,
    path,
  }: { type: Type; func: string; payload: any; path?: any[] }
) {
  switch (type) {
    case "loading":
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [func]: payload,
        },
      };
    case "outputDisplay":
      return {
        ...state,
        outputDisplays: {
          ...state.outputDisplays,
          [func]: payload,
        },
      };
    case "output":
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [func]: false,
        },
        outputs: {
          ...state.outputs,
          [func]: payload,
        },
        history: [...state.history, payload],
      };
    case "input": {
      const data =
        payload === DELETE_ITEM
          ? del(state.inputs[func], path)
          : set(state.inputs[func], path, payload);
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [func]: data,
        },
      };
    }
    case "error":
      return {
        ...state,
        errors: {
          ...state.errors,
          [func]: payload,
        },
      };
  }
}

export default function CandidUI({
  className,
  canisterId,
  candid,
  jsBindings,
}: {
  className?: string;
  canisterId: string;
  candid: string;
  jsBindings: Bindings["js"];
}) {
  const [methods, setMethods] = useState<IDL.ServiceClass["_fields"]>([]);
  const [actor, setActor] = useState(null);
  const [state, dispatch] = useReducer(reducer, {
    isLoading: {},
    inputs: {},
    errors: {},
    outputs: {},
    outputDisplays: {},
    history: [],
  });

  useEffect(() => {
    (async () => {
      let mod;
      const dataUri =
        "data:text/javascript;charset=utf-8," + encodeURIComponent(jsBindings);
      try {
        mod = await eval(`import("${dataUri}")`);
      } catch (error) {
        console.warn(error);
        return;
      }

      const actor_ = Actor.createActor(mod.default, {
        agent,
        canisterId,
      });
      setActor(actor_);
      const sortedMethods = Actor.interfaceOf(actor_)._fields.sort(([a], [b]) =>
        a > b ? 1 : -1
      );
      setMethods(sortedMethods);
      sortedMethods
        .filter(
          ([_, func]) =>
            func.annotations[0] === "query" && !func.argTypes.length
        )
        .forEach(async ([name, func]) => {
          dispatch({ type: "loading", func: name, payload: true });
          try {
            const res = await actor_[name]();
            dispatch({ type: "output", func: name, payload: { res } });
          } catch (error) {
            dispatch({
              type: "output",
              func: name,
              payload: { err: error.message },
            });
          }
        });
    })();
  }, []);

  const call = useCallback(
    async (funcName: string, func: IDL.FuncClass, inputs = []) => {
      const validated = func.argTypes.map((type, i) =>
        validate(type, inputs[i])
      );
      const args = validated.map(([res]) => res);
      const errors = validated.map(([_, err]) => err);
      if (any(errors)) {
        console.warn(errors);
        dispatch({ type: "error", func: funcName, payload: errors });
      } else {
        dispatch({ type: "loading", func: funcName, payload: true });
        dispatch({ type: "error", func: funcName, payload: null });
        try {
          console.log("call", funcName, args);
          const res = await actor[funcName](...args);
          dispatch({ type: "output", func: funcName, payload: { res } });
        } catch (error) {
          dispatch({
            type: "output",
            func: funcName,
            payload: { err: error.message },
          });
          console.warn(error);
        }
      }
    },
    [actor]
  );

  return (
    <div className={className}>
      <div className="px-2 py-2 bg-gray-100 dark:bg-gray-800 flex justify-between items-baseline">
        <span className="font-bold">Canister Methods</span>
        <a
          className="hover:underline text-blue-600 flex items-center text-xs"
          href={`${CANDID_UI_URL}?id=${canisterId}&did=${encodeURIComponent(
            window.btoa(candid)
          )}`}
          target="_blank"
        >
          Go to Candid UI <FiExternalLink className="ml-1" />
        </a>
      </div>
      {methods.map(([funcName, func]) => {
        const isQuery = func.annotations[0] === "query";
        const outputDisplay =
          state.outputDisplays[funcName] || OUTPUT_DISPLAYS[0];

        return (
          <form
            key={funcName}
            className="border border-gray-300 dark:border-gray-700 mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              call(funcName, func, state.inputs[funcName]);
            }}
          >
            <div className="px-2 py-2 bg-gray-100 dark:bg-gray-800">
              {funcName}
            </div>
            <div key={funcName} className="px-2 py-2">
              {func.argTypes.length > 0
                ? func.argTypes.map((arg, i) => {
                    const id = `${funcName}-${i}`;
                    return (
                      <div key={id} className="flex flex-col py-1">
                        <Input
                          type={arg}
                          inputs={state.inputs[funcName]}
                          errors={state.errors[funcName]}
                          path={[i]}
                          handleInput={(payload, path) =>
                            dispatch({
                              type: "input",
                              func: funcName,
                              path,
                              payload,
                            })
                          }
                        />
                      </div>
                    );
                  })
                : null}
              <button
                className="mt-2 w-16 py-1 text-center btn-default"
                disabled={state.isLoading[funcName]}
              >
                {state.isLoading[funcName] ? (
                  <CgSpinner className="inline-block animate-spin" />
                ) : isQuery ? (
                  "Query"
                ) : (
                  "Call"
                )}
              </button>
              <div className="mt-2 flex items-center">
                <span className="text-xs italic text-gray-500">
                  <BsArrowReturnRight className="inline" />
                  {func.retTypes.length ? getShortname(func.retTypes[0]) : "()"}
                </span>
                {state.outputs[funcName] && !state.outputs[funcName].err && (
                  <div className="text-xs ml-2">
                    {OUTPUT_DISPLAYS.map((display) => (
                      <button
                        type="button"
                        className={classNames("px-1 py-0.5 btn-default", {
                          "text-gray-500": display !== outputDisplay,
                        })}
                        onClick={() =>
                          dispatch({
                            type: "outputDisplay",
                            func: funcName,
                            payload: display,
                          })
                        }
                      >
                        {display}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {state.outputs[funcName] ? (
                <div className="mt-1">
                  <Output
                    display={outputDisplay}
                    type={func.retTypes[0]}
                    value={state.outputs[funcName]}
                  />
                </div>
              ) : null}
            </div>
          </form>
        );
      })}
    </div>
  );
}
