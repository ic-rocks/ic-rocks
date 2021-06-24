import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import extendProtobuf from "agent-pb";
import classNames from "classnames";
import { Bindings } from "didc";
import Link from "next/link";
import { del, set } from "object-path-immutable";
import protobuf, { Method } from "protobufjs/light";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { BsArrowReturnRight } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { getShortname, validate } from "../lib/candid/utils";
import protobufJson from "../lib/canisters/proto.json";
import { pluralize } from "../lib/strings";
import {
  CandidInput,
  CANDID_OUTPUT_DISPLAYS,
} from "./CanisterUI/CandidElements";
import {
  Message as PbMessage,
  PROTOBUF_OUTPUT_DISPLAYS,
} from "./CanisterUI/ProtobufElements";
import {
  DELETE_ITEM,
  Output,
  OutputDisplayButtons,
  QueryButton,
} from "./CanisterUI/Shared";

const root = protobuf.Root.fromJSON(protobufJson as protobuf.INamespace);
const CANDID_UI_URL = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/";
const agent = new HttpAgent({ host: "https://ic0.app" });

export type Type = "loading" | "input" | "output" | "error" | "outputDisplay";
type CanisterMethod = Record<string, IDL.FuncClass | Method>;

const methodCmp = (a, b) => (a[0] > b[0] ? 1 : -1);

const isProtobufMethod = (method: any): method is Method =>
  method instanceof Method;

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
      console.log(path, payload, data, state.inputs[func]);
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
  protobuf,
  isAttached = false,
}: {
  className?: string;
  canisterId: string;
  candid: string;
  jsBindings: Bindings["js"];
  protobuf?: string;
  isAttached?: boolean;
}) {
  const [methods, setMethods] = useState<CanisterMethod>({});
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
    if (!actor || !protobuf) return;

    const service = protobuf.match(/service\s*(\w+)/)[1];
    if (!service) return;

    const serviceDef = root.lookupService(service);
    serviceDef.resolveAll();
    extendProtobuf(actor, serviceDef);
    setMethods((methods) => ({
      ...methods,
      ...Object.fromEntries(
        serviceDef.methodsArray.map((method) => [method.name, method])
      ),
    }));
    serviceDef.methodsArray
      .filter(
        (method) =>
          method.getOption("annotation") === "query" &&
          !method.resolvedRequestType.fieldsArray.length
      )
      .forEach(async (method) => {
        dispatch({ type: "loading", func: method.name, payload: true });
        try {
          const res = await actor[method.name]({});
          console.log("call", method.name, "res:", res);
          dispatch({ type: "output", func: method.name, payload: { res } });
        } catch (error) {
          console.warn(error);
          dispatch({
            type: "output",
            func: method.name,
            payload: { err: error.message },
          });
        }
      });
  }, [actor, protobuf]);

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
      const candidMethods = Actor.interfaceOf(actor_)._fields;
      setMethods((methods) => ({
        ...methods,
        ...Object.fromEntries(candidMethods),
      }));
      candidMethods
        .filter(
          ([_, func]) =>
            func.annotations[0] === "query" && !func.argTypes.length
        )
        .forEach(async ([name, func]) => {
          dispatch({ type: "loading", func: name, payload: true });
          try {
            const res = await actor_[name]();
            console.log("call", name, "res:", res);
            // If response is > 1kb, default to raw display
            const buf = func.retTypes[0].encodeValue(res);
            if (buf.length > 1000) {
              dispatch({ type: "outputDisplay", func: name, payload: "Raw" });
            }
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
  }, [jsBindings]);

  const call = useCallback(
    async (funcName: string, func: IDL.FuncClass | Method, inputs = []) => {
      let args = [],
        errors = [];
      if (isProtobufMethod(func)) {
        func.resolve();
        const validated = validate(func.resolvedRequestType, inputs[0]);
        args = [validated[0]];
        errors = [validated[1]];
      } else {
        const validated = func.argTypes.map((type, i) =>
          validate(type, inputs[i])
        );
        args = validated.map(([res]) => res);
        errors = validated.map(([_, err]) => err);
      }
      if (errors.some(Boolean)) {
        console.warn(errors);
        dispatch({ type: "error", func: funcName, payload: errors });
      } else {
        dispatch({ type: "loading", func: funcName, payload: true });
        dispatch({ type: "error", func: funcName, payload: null });
        try {
          console.log("call", funcName, args);
          const res = await actor[funcName](...args);
          console.log("call", funcName, "res:", res);

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

  const sortedMethods = Object.entries(methods).sort(methodCmp);

  return (
    <div className={className}>
      <div className="px-2 py-2 bg-heading flex justify-between items-baseline">
        <div>
          <span className="font-bold">
            {sortedMethods.length}{" "}
            {pluralize("Canister Method", sortedMethods.length)}
          </span>
          {isAttached && (
            <div className="inline-flex items-stretch">
              <label className="rounded-l text-xs py-1 px-2 bg-yellow-200 dark:text-black ml-2">
                Attached
              </label>
              <Link href={`/principal/${canisterId}`}>
                <a
                  className="rounded-r cursor-pointer py-1.5 px-2 text-xs bg-yellow-200 hover:bg-yellow-400 transition-colors dark:text-black"
                  title="Remove attached candid"
                >
                  <FaTimes />
                </a>
              </Link>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <a
            className="hover:underline text-blue-600 flex items-center text-xs"
            href={`${CANDID_UI_URL}?id=${canisterId}&did=${encodeURIComponent(
              window.btoa(candid)
            )}`}
            target="_blank"
          >
            View in Candid UI <FiExternalLink className="ml-1" />
          </a>
        </div>
      </div>
      {sortedMethods.map(([funcName, method]) => {
        let isPb, isQuery, inputs, responseTypes;
        if (isProtobufMethod(method)) {
          isPb = true;
          funcName = method.name;
          isQuery = method.getOption("annotation") === "query";
          inputs = (
            <PbMessage
              objectName={method.requestType}
              type={method.resolvedRequestType}
              inputs={state.inputs[funcName]}
              errors={state.errors[funcName]}
              path={[0]}
              handleInput={(payload, path) =>
                dispatch({
                  type: "input",
                  func: funcName,
                  path,
                  payload,
                })
              }
              isInput={true}
            />
          );
          responseTypes = method.responseType;
        } else {
          isPb = false;
          isQuery = method.annotations[0] === "query";
          if (method.argTypes.length > 0) {
            inputs = method.argTypes.map((arg, i) => {
              return (
                <CandidInput
                  key={`${funcName}-${i}`}
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
              );
            });
          }
          responseTypes = method.retTypes.length
            ? getShortname(method.retTypes[0])
            : "()";
        }

        const OUTPUT_DISPLAYS = isPb
          ? PROTOBUF_OUTPUT_DISPLAYS
          : CANDID_OUTPUT_DISPLAYS;
        const outputDisplay =
          state.outputDisplays[funcName] || OUTPUT_DISPLAYS[0];
        const format = isPb ? "protobuf" : "candid";

        return (
          <form
            key={funcName}
            className="border border-gray-300 dark:border-gray-700 mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              call(funcName, method, state.inputs[funcName]);
            }}
          >
            <div className="px-2 py-2 bg-heading flex justify-between items-center">
              {funcName}
              <label
                className={classNames("label-tag ml-2", {
                  "bg-red-400": isPb,
                  "bg-blue-400": !isPb,
                })}
              >
                {format}
              </label>
            </div>
            <div className="px-2 py-2">
              {inputs}
              <QueryButton
                isLoading={state.isLoading[funcName]}
                isQuery={isQuery}
              />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs italic text-gray-500">
                  <BsArrowReturnRight className="inline" />
                  {responseTypes}
                </span>
                {state.outputs[funcName] && !state.outputs[funcName].err && (
                  <OutputDisplayButtons
                    format={format}
                    value={outputDisplay}
                    onClick={(value) =>
                      dispatch({
                        type: "outputDisplay",
                        func: funcName,
                        payload: value,
                      })
                    }
                  />
                )}
              </div>
              {state.outputs[funcName] ? (
                <div className="mt-1">
                  <Output
                    format={format}
                    display={outputDisplay}
                    type={
                      isPb
                        ? (method as Method).resolvedResponseType
                        : (method as IDL.FuncClass).retTypes[0]
                    }
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
