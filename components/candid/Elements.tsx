import { IDL } from "@dfinity/agent";
import classNames from "classnames";
import { useRouter } from "next/router";
import { get } from "object-path-immutable";
import React, { useEffect, useState } from "react";
import { BiMinus, BiPlus } from "react-icons/bi";
import {
  getDefaultValue,
  getShortname,
  stringify,
} from "../../lib/candid/utils";
import { maybeTimestamp } from "../../lib/numbers";
import { isUrl, pluralize } from "../../lib/strings";

export const DELETE_ITEM = Symbol("DELETE_ITEM");

export const OUTPUT_DISPLAYS = ["Pretty", "JSON", "Candid", "Raw"] as const;
export const BUFFER_ENCODINGS = ["Hex", "UTF-8", "Base64"] as const;
export const VEC_NAT8_FORMATS = ["Hex", "UTF-8", "Base64", "Raw"] as const;

const Nested = ({ children }) => (
  <div className="pl-2 border-l border-gray-300 dark:border-gray-700">
    {children}
  </div>
);

const Label = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <label
    className={classNames(className, "block text-xs italic text-gray-500")}
  >
    {children}
  </label>
);

const BufferInput = ({
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
  onChange: (Buffer) => void;
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
        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-sm"
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

export const Input = ({
  argName,
  path = [],
  type,
  showLabel = true,
  className,
  inputs,
  errors,
  handleInput,
}: {
  argName?: string;
  path: (string | number)[];
  type: IDL.Type;
  showLabel?: boolean;
  inputs: any;
  className?: string;
  errors: any;
  handleInput: (value: any, path: any[]) => void;
}) => {
  if (type instanceof IDL.NullClass) {
    return null;
  }

  const shortname = getShortname(type);
  const description = argName != null ? `${argName} (${shortname})` : shortname;
  const label = <Label>{description}</Label>;
  const error = get(errors, path, null);

  if (type instanceof IDL.RecordClass || type instanceof IDL.RecClass) {
    const fields =
      type instanceof IDL.RecClass ? type["_type"]["_fields"] : type["_fields"];
    const isTuple = type instanceof IDL.TupleClass;
    return (
      <div className={className}>
        {label}
        <Nested>
          {fields.map(([fieldName, fieldType], i) => (
            <Input
              key={fieldName}
              type={fieldType}
              argName={isTuple ? i : fieldName}
              path={path.concat([isTuple ? i : fieldName])}
              className="pb-1"
              inputs={inputs}
              errors={errors}
              handleInput={handleInput}
            />
          ))}
        </Nested>
      </div>
    );
  }

  if (type instanceof IDL.VecClass) {
    const vec = get(inputs, path, []);
    const isVecNat8 = type["_type"].name === "nat8";
    const [vecInput, setVecInput] = useState<typeof VEC_NAT8_FORMATS[number]>(
      VEC_NAT8_FORMATS[0]
    );
    return (
      <div className={className}>
        <div className={classNames("flex items-center", { "mb-1": isVecNat8 })}>
          {label}
          {isVecNat8 && (
            <div className="text-xs ml-2">
              {VEC_NAT8_FORMATS.map((input) => (
                <button
                  key={input}
                  type="button"
                  className={classNames("px-1 py-0.5 btn-default", {
                    "text-gray-500": input !== vecInput,
                  })}
                  onClick={() => setVecInput(input)}
                >
                  {input}
                </button>
              ))}
            </div>
          )}
        </div>
        {!isVecNat8 || vecInput === "Raw" ? (
          <Nested>
            {vec.map((_, i) => (
              <div className="flex items-start mb-1" key={i}>
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
                  type={type["_type"]}
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
                  handleInput(undefined, path.concat(vec.length));
                }}
              >
                <BiPlus />
              </button>
              <Label>Add item</Label>
            </div>
          </Nested>
        ) : (
          <BufferInput
            placeholder={description}
            onChange={(buf) => handleInput(Array.from(buf), path)}
            encoding={vecInput as BufferEncoding}
            value={Buffer.from(vec)}
          />
        )}
      </div>
    );
  }

  if (type instanceof IDL.VariantClass) {
    const selected = get(inputs, path) || getDefaultValue(type);
    const selectedName = Object.keys(selected)[0];
    const selectedField = type["_fields"].find(
      ([name]) => name === selectedName
    );

    return (
      <div className={className}>
        <div>{showLabel && label}</div>
        <select
          className="p-1 bg-gray-100 dark:bg-gray-800 cursor-pointer"
          onChange={(e) => handleInput({ [e.target.value]: null }, path)}
          value={selectedName}
          required
        >
          <option disabled>select{argName ? ` ${argName}` : null}...</option>
          {type["_fields"].map(([fieldName]) => {
            return (
              <option key={fieldName} value={fieldName}>
                {fieldName}
              </option>
            );
          })}
        </select>
        {selectedField && (
          <Input
            type={selectedField[1]}
            argName={selectedName}
            path={path.concat([selectedName])}
            inputs={inputs}
            errors={errors}
            handleInput={handleInput}
          />
        )}
      </div>
    );
  }

  if (type instanceof IDL.BoolClass) {
    return (
      <div className={className}>
        <Label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="mr-1"
            onChange={(e) => handleInput(e.target.checked, path)}
            checked={get(inputs, path, false)}
          />
          {description}
        </Label>
      </div>
    );
  }

  if (type instanceof IDL.OptClass) {
    const checked = get(inputs, path, null);
    return (
      <div className={className}>
        <Label className="flex items-center">
          <input
            type="checkbox"
            className="mr-1"
            onChange={(e) =>
              handleInput(
                e.target.checked ? getDefaultValue(type["_type"]) : null,
                path
              )
            }
            checked={checked !== null}
          />
          {description}
        </Label>
        {checked !== null && (
          <div className="pl-4">
            <Input
              type={type["_type"]}
              path={path}
              showLabel={false}
              inputs={inputs}
              errors={errors}
              handleInput={handleInput}
            />
          </div>
        )}
      </div>
    );
  }

  const inputType =
    type instanceof IDL.FixedNatClass ||
    type instanceof IDL.FixedIntClass ||
    type instanceof IDL.NatClass ||
    type instanceof IDL.IntClass
      ? "number"
      : "text";
  let min, max;
  if (type instanceof IDL.FixedNatClass) {
    min = 0;
    max = 2 ** type.bits - 1;
  } else if (type instanceof IDL.FixedIntClass) {
    min = -(2 ** (type["_bits"] - 1));
    max = 2 ** (type["_bits"] - 1) - 1;
  }
  return (
    <div className={classNames(className, "flex flex-col")}>
      {showLabel && label}
      <input
        placeholder={description}
        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-sm"
        type={inputType}
        onChange={(e) => handleInput(e.target.value, path)}
        value={get(inputs, path, "")}
        required={inputType == "number" || type instanceof IDL.PrincipalClass}
        min={min}
        max={max}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

const EmptyOutput = ({ value = "empty" }) => (
  <span className="text-gray-500">{value}</span>
);

const OutputWrapper = ({
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

export const Output = ({
  type,
  argName,
  value: { res, err },
  showLabel = true,
  display,
}: {
  type: IDL.Type;
  argName?: string | number;
  value: any;
  showLabel?: boolean;
  display: typeof OUTPUT_DISPLAYS[number];
}) => {
  if (err) {
    return <OutputWrapper force={true} value={err} className="text-red-500" />;
  }

  if (!type) {
    return <EmptyOutput />;
  }

  if (display === "Candid") {
    return (
      <OutputWrapper
        force={true}
        value={IDL.FuncClass.argsToString([type], [res])}
      />
    );
  } else if (display === "JSON") {
    return <OutputWrapper force={true} value={stringify(res)} />;
  } else if (display === "Raw") {
    const raw = type.encodeValue(res);
    return (
      <div>
        <Label>
          {raw.length} {pluralize("byte", raw.length)}
        </Label>
        <OutputWrapper force={true} value={"0x" + raw.toString("hex")} />
      </div>
    );
  }

  const shortname = getShortname(type);
  const description = argName != null ? `${argName} (${shortname})` : shortname;
  const label = <Label>{description}</Label>;

  if (type instanceof IDL.VecClass) {
    const length = res.length;
    const lengthLabel = <Label className="ml-2">(len {length})</Label>;
    if (
      type["_type"] instanceof IDL.FixedNatClass ||
      type["_type"] instanceof IDL.FixedIntClass ||
      type["_type"] instanceof IDL.NatClass ||
      type["_type"] instanceof IDL.IntClass
    ) {
      if (type["_type"].name === "nat8") {
        const [bufDisplay, setBufDisplay] =
          useState<typeof VEC_NAT8_FORMATS[number]>("Hex");
        const buf = Buffer.from(res);
        const out =
          bufDisplay === "Hex"
            ? "0x" + buf.toString(bufDisplay as BufferEncoding)
            : bufDisplay === "Raw"
            ? JSON.stringify(res)
            : buf.toString(bufDisplay as BufferEncoding);
        return (
          <div>
            <div
              className={classNames("flex items-center", {
                "mb-1": length > 0,
              })}
            >
              {label}
              {length > 0 && (
                <>
                  <div className="text-xs ml-2">
                    {VEC_NAT8_FORMATS.map((display) => (
                      <button
                        key={display}
                        type="button"
                        className={classNames("px-1 py-0.5 btn-default", {
                          "text-gray-500": display !== bufDisplay,
                        })}
                        onClick={() => setBufDisplay(display)}
                      >
                        {display}
                      </button>
                    ))}
                  </div>
                  {lengthLabel}
                </>
              )}
            </div>
            {length ? <OutputWrapper value={out} /> : <EmptyOutput />}
          </div>
        );
      } else {
        return (
          <div>
            <div className="flex">
              {label}
              {length > 0 && lengthLabel}
            </div>
            {length ? (
              <OutputWrapper value={stringify(res)} />
            ) : (
              <EmptyOutput />
            )}
          </div>
        );
      }
    } else {
      if (length) {
        return (
          <div>
            <div className="flex">
              {label}
              {lengthLabel}
            </div>
            <Nested>
              {res.map((r, i) => (
                <div key={i} className="mb-2">
                  <Output
                    type={type["_type"]}
                    argName={i}
                    value={{ res: r }}
                    display={display}
                  />
                </div>
              ))}
            </Nested>
          </div>
        );
      } else {
        return (
          <div>
            {label}
            <EmptyOutput />
          </div>
        );
      }
    }
  } else if (type instanceof IDL.RecordClass || type instanceof IDL.RecClass) {
    const fields =
      type instanceof IDL.RecClass ? type["_type"]["_fields"] : type["_fields"];
    const isTuple = type instanceof IDL.TupleClass;
    return (
      <div>
        {label}
        <Nested>
          {fields.map(([fieldName, fieldType], i) => {
            const key = isTuple ? i : fieldName;
            return (
              <div key={key}>
                <Output
                  type={fieldType}
                  argName={key}
                  value={{ res: res[key] }}
                  display={display}
                />
              </div>
            );
          })}
        </Nested>
      </div>
    );
  } else if (type instanceof IDL.VariantClass) {
    const selectedName = Object.keys(res)[0];
    const selectedField = type["_fields"].find(
      ([name]) => name === selectedName
    );

    return (
      <div>
        <div>{showLabel && label}</div>
        <div>{selectedName}</div>
        {!(selectedField[1] instanceof IDL.NullClass) && (
          <Output
            type={selectedField[1]}
            argName={selectedName}
            value={{ res: res[selectedName] }}
            display={display}
          />
        )}
      </div>
    );
  } else if (type instanceof IDL.OptClass) {
    if (res.length === 0) {
      return (
        <div>
          {label}
          <EmptyOutput />
        </div>
      );
    } else {
      return (
        <div>
          {label}
          <Output
            type={type["_type"]}
            value={{ res: res[0] }}
            showLabel={false}
            display={display}
          />
        </div>
      );
    }
  } else if (
    type instanceof IDL.FixedNatClass ||
    type instanceof IDL.FixedIntClass ||
    type instanceof IDL.NatClass ||
    type instanceof IDL.IntClass
  ) {
    let ts;
    if (typeof argName === "string" && argName.match(/time|date|seconds/i)) {
      ts = maybeTimestamp(res);
    }
    return (
      <div>
        {label}
        {res.toString()}
        {!!ts && (
          <Label className="inline ml-2">
            ({ts.toString()} - {ts.toRelative()})
          </Label>
        )}
      </div>
    );
  } else if (type instanceof IDL.TextClass) {
    return (
      <div>
        <div className="flex">
          {label}
          <Label className="ml-2">(len {res.length})</Label>
        </div>
        {res.length ? (
          isUrl(res) ? (
            <a
              href={res}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              {res}
            </a>
          ) : (
            <OutputWrapper value={res} />
          )
        ) : (
          <EmptyOutput />
        )}
      </div>
    );
  } else if (type instanceof IDL.PrincipalClass) {
    const principal = res.toText();
    const router = useRouter();
    const { principalId } = router.query;
    return (
      <div>
        {label}
        {principal !== principalId ? (
          <a
            href={`/principal/${principal}`}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            {principal}
          </a>
        ) : (
          principal
        )}
      </div>
    );
  } else {
    return (
      <div>
        {label}
        <OutputWrapper value={stringify(res)} />
      </div>
    );
  }
};
