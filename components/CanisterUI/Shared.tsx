import { IDL } from "@dfinity/candid";
import classNames from "classnames";
import protobuf from "protobufjs";
import React, { useEffect, useState } from "react";
import { BiMinus, BiPlus } from "react-icons/bi";
import { maybeTimestamp } from "../../lib/numbers";
import { Label } from "../Forms/Label";
import SpinnerButton from "../Forms/SpinnerButton";
import {
  CandidInput,
  CandidOutput,
  CandidOutputDisplay,
  CANDID_OUTPUT_DISPLAYS,
} from "./CandidElements";
import {
  Message,
  ProtobufOutputDisplay,
  PROTOBUF_OUTPUT_DISPLAYS,
} from "./ProtobufElements";

export type Format = "candid" | "protobuf";

export const DELETE_ITEM = Symbol("DELETE_ITEM");

export const BUFFER_ENCODINGS = ["Hex", "UTF-8", "Base64", "Raw"] as const;

export const OutputDisplayButtons = ({
  format,
  value,
  onClick,
}: {
  format: Format;
  value: CandidOutputDisplay | ProtobufOutputDisplay;
  onClick: (option: CandidOutputDisplay | ProtobufOutputDisplay) => void;
}) => {
  return (
    <div className="text-xs">
      {(format === "candid"
        ? CANDID_OUTPUT_DISPLAYS
        : PROTOBUF_OUTPUT_DISPLAYS
      ).map((option) => (
        <button
          key={option}
          type="button"
          className={classNames("px-1 py-0.5 btn-default", {
            "text-gray-500": option !== value,
          })}
          onClick={() => onClick(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export const Node = ({
  label,
  children,
  nested = false,
  buttons,
  showButtons = false,
}: {
  label?: React.ReactNode;
  children?: React.ReactNode;
  nested?: boolean;
  buttons?: React.ReactNode;
  showButtons?: boolean;
}) => {
  return (
    <div className="flex flex-col">
      <div
        className={classNames("flex items-center", {
          "pb-1": showButtons,
        })}
      >
        {label}
        {showButtons && buttons}
      </div>
      {nested ? <Nested>{children}</Nested> : children}
    </div>
  );
};

export const QueryButton = ({
  isLoading,
  isQuery,
}: {
  isLoading: boolean;
  isQuery: boolean;
}) => (
  <SpinnerButton
    className="py-1 mt-2 w-16 text-center btn-default"
    isLoading={isLoading}
  >
    {isQuery ? "Query" : "Call"}
  </SpinnerButton>
);

export const Nested = ({ children }) => (
  <div className="flex flex-col gap-1 pl-2 border-l border-gray-300 dark:border-gray-700">
    {children}
  </div>
);

export const Input = ({
  type,
  argName,
  path,
  showLabel,
  inputs,
  errors,
  handleInput,
}: {
  type: IDL.Type | protobuf.Type | string;
  argName: any;
  path: any;
  showLabel: any;
  inputs: any;
  errors: any;
  handleInput: any;
}) => {
  return type instanceof IDL.Type ? (
    <CandidInput
      type={type}
      argName={argName}
      path={path}
      showLabel={showLabel}
      inputs={inputs}
      errors={errors}
      handleInput={handleInput}
    />
  ) : (
    <Message
      type={type}
      objectName={argName}
      path={path}
      isInput={true}
      inputs={inputs}
      errors={errors}
      handleInput={handleInput}
    />
  );
};

export const BufferEncodingButtons = ({
  active,
  onChange,
  showRaw = true,
}: {
  active: typeof BUFFER_ENCODINGS[number];
  onChange: (val: typeof BUFFER_ENCODINGS[number]) => void;
  showRaw?: boolean;
}) => {
  const options = showRaw ? BUFFER_ENCODINGS : BUFFER_ENCODINGS.slice(0, -1);
  return (
    <div className="ml-2 text-xs">
      {options.map((value) => (
        <button
          key={value}
          type="button"
          className={classNames("px-1 py-0.5 btn-default", {
            "text-gray-500": value !== active,
          })}
          onClick={() => onChange(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
};

export const ArrayInput = ({
  array,
  handleInput,
  path = [],
  type,
  inputs,
  errors,
}: {
  array: any[];
  handleInput: (value: any, path: any[]) => void;
  path: (string | number)[];
  type: IDL.Type | protobuf.Type | string;
  inputs: any;
  errors: any;
}) => {
  return (
    <Nested>
      {array.map((_, i) => (
        <div className="flex items-start" key={i}>
          <button
            type="button"
            className="p-1.5 mr-1 btn-default"
            onClick={(e) => {
              e.preventDefault();
              handleInput(DELETE_ITEM, path.concat(i));
            }}
          >
            <BiMinus />
          </button>
          <Input
            type={type}
            argName={String(i)}
            path={path.concat([i])}
            showLabel={false}
            inputs={inputs}
            errors={errors}
            handleInput={handleInput}
          />
        </div>
      ))}
      <div className="flex items-center">
        <button
          type="button"
          className="p-1.5 mr-1 btn-default"
          onClick={(e) => {
            e.preventDefault();
            handleInput(undefined, path.concat(array.length));
          }}
        >
          <BiPlus />
        </button>
        <Label>Add item</Label>
      </div>
    </Nested>
  );
};

export const BufferInput = ({
  encoding = "utf-8",
  value,
  placeholder,
  error,
  onChange,
}: {
  encoding?: BufferEncoding;
  value?: Buffer;
  placeholder?: string;
  error?: string;
  onChange: (buf: Buffer) => void;
}) => {
  const [currentValue, setCurrentValue] = useState("");
  const [currentError, setCurrentError] = useState("");
  useEffect(() => {
    setCurrentError("");
    setCurrentValue("");
  }, [encoding]);

  return (
    <div className="flex flex-col">
      <input
        placeholder={placeholder}
        className="py-1 px-2 text-sm bg-gray-100 dark:bg-gray-800"
        type="text"
        onChange={(e) => {
          setCurrentValue(e.target.value);
          try {
            const buf = Buffer.from(e.target.value, encoding);
            onChange(buf);
            setCurrentError("");
          } catch (error) {
            setCurrentError(error.message);
          }
        }}
        value={currentError ? currentValue : value.toString(encoding)}
      />
      {currentError && (
        <span className="text-xs text-red-500">{currentError}</span>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export const Output = ({
  format,
  value: { res, err },
  type,
  display,
}: {
  format: Format;
  value: { res?: any; err?: any };
  type?: IDL.Type | protobuf.Type;
  display?: CandidOutputDisplay | ProtobufOutputDisplay;
}) => {
  if (err) {
    return <OutputWrapper force={true} value={err} className="text-red-500" />;
  }

  if (format === "candid") {
    return (
      <CandidOutput display={display} type={type as IDL.Type} value={res} />
    );
  } else {
    return (
      <Message
        type={type as protobuf.Type}
        outputs={res}
        display={display as ProtobufOutputDisplay}
      />
    );
  }
};

export const EmptyOutput = ({ value = "empty" }) => (
  <span className="text-gray-500">{value}</span>
);

export const NumberDisplay = ({
  argName,
  value,
}: {
  argName: string | number;
  value: any;
}) => {
  let ts;
  if (typeof argName === "string" && argName.match(/time|date|seconds/i)) {
    ts = maybeTimestamp(value);
  }
  return (
    <div>
      {value.toString()}
      {!!ts && (
        <Label className="inline ml-2">
          ({ts.toString()} - {ts.toRelative()})
        </Label>
      )}
    </div>
  );
};

export const BufferDisplay = ({
  value,
  label,
}: {
  value: string | Array<number>;
  label: JSX.Element;
}) => {
  const length = value.length;
  const [bufDisplay, setBufDisplay] =
    useState<typeof BUFFER_ENCODINGS[number]>("Hex");
  const buf = Buffer.from(value);
  const out =
    bufDisplay === "Hex"
      ? buf.toString("hex")
      : bufDisplay === "Base64"
      ? buf.toString("base64")
      : bufDisplay === "Raw"
      ? JSON.stringify(Array.from(buf))
      : buf.toString("utf-8");

  const lengthLabel = <Label className="ml-2">(len {length})</Label>;

  const buttons = (
    <>
      <BufferEncodingButtons active={bufDisplay} onChange={setBufDisplay} />
      {lengthLabel}
    </>
  );
  return (
    <Node showButtons={length > 0} label={label} buttons={buttons}>
      {length ? (
        <OutputWrapper value={out} force={bufDisplay === "Raw"} />
      ) : (
        <EmptyOutput />
      )}
    </Node>
  );
};

export const OutputWrapper = ({
  value,
  className,
  force = false,
}: {
  value: string;
  className?: string;
  force?: boolean;
}) => {
  if (force || value.length >= 32) {
    return (
      <pre
        style={{ maxHeight: "12rem" }}
        className={classNames(
          className,
          "border border-gray-300 dark:border-gray-700 p-1 whitespace-pre-wrap break-all text-xs overflow-auto"
        )}
      >
        {value}
      </pre>
    );
  }
  return <>{value}</>;
};
