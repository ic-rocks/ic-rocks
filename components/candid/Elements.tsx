import { IDL } from "@dfinity/agent";
import classNames from "classnames";
import { get } from "object-path-immutable";
import React from "react";
import { BiMinus, BiPlus } from "react-icons/bi";
import {
  getDefaultValue,
  getShortname,
  stringify,
} from "../../lib/candid/utils";

export const DELETE_ITEM = Symbol("DELETE_ITEM");

export const OUTPUT_DISPLAYS = ["Pretty", "JSON", "Candid", "Raw"] as const;

const Nested = ({ children }) => (
  <div className="pl-2 border-l border-gray-300 dark:border-gray-700">
    {children}
  </div>
);

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
  const label = (
    <label className="text-xs italic text-gray-500">{description}</label>
  );
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
    return (
      <div className={className}>
        {label}
        <Nested>
          {vec.map((_, i) => (
            <div className="flex items-start mb-1" key={i}>
              <button
                type="button"
                className="p-1 mr-1 btn-default"
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
              className="p-1 mr-1 btn-default"
              onClick={(e) => {
                e.preventDefault();
                handleInput(undefined, path.concat(vec.length));
              }}
            >
              <BiPlus />
            </button>
            <label className="text-xs italic text-gray-500">Add item</label>
          </div>
        </Nested>
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
        <label className="flex items-center text-xs italic text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            className="mr-1"
            onChange={(e) => handleInput(e.target.checked, path)}
            checked={get(inputs, path, false)}
          />
          {description}
        </label>
      </div>
    );
  }

  if (type instanceof IDL.OptClass) {
    const checked = get(inputs, path, null);
    return (
      <div className={className}>
        <label className="flex items-center text-xs italic text-gray-500">
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
        </label>
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
    type instanceof IDL.FixedNatClass || type instanceof IDL.FixedIntClass
      ? "number"
      : "text";
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
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

type OUTPUT_DISPLAY = "raw" | "parsed";

const EmptyOutput = ({ value = "empty" }) => (
  <span className="text-gray-500">{value}</span>
);

const OutputWrapper = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => {
  if (value.length > 50) {
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
  argName?: string;
  value: any;
  showLabel?: boolean;
  display: typeof OUTPUT_DISPLAYS[number];
}) => {
  if (err) {
    return <OutputWrapper value={err} className="text-red-500" />;
  }

  if (display === "Candid") {
    return <OutputWrapper value={IDL.FuncClass.argsToString([type], [res])} />;
  } else if (display === "JSON") {
    return <OutputWrapper value={stringify(res)} />;
  } else if (display === "Raw") {
    return (
      <OutputWrapper value={"0x" + type.encodeValue(res).toString("hex")} />
    );
  }

  const shortname = getShortname(type);
  const description = argName != null ? `${argName} (${shortname})` : shortname;
  const label = (
    <label className="block text-xs italic text-gray-500">{description}</label>
  );

  if (type instanceof IDL.VecClass) {
    if (
      type["_type"] instanceof IDL.FixedNatClass ||
      type["_type"] instanceof IDL.FixedIntClass
    ) {
      if (type["_type"].name === "nat8") {
        // buffer
        return (
          <div>
            {label}
            <OutputWrapper value={"0x" + Buffer.from(res).toString("hex")} />
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
    } else {
      if (res.length) {
        return (
          <div>
            {label}
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
            <EmptyOutput value="[]" />
          </div>
        );
      }
    }
  } else if (type instanceof IDL.RecordClass || type instanceof IDL.RecClass) {
    const fields =
      type instanceof IDL.RecClass ? type["_type"]["_fields"] : type["_fields"];
    const isTuple = type instanceof IDL.TupleClass;
    return (
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
    type instanceof IDL.FixedIntClass
  ) {
    return (
      <div>
        {label}
        {res.toString()}
      </div>
    );
  } else if (type instanceof IDL.TextClass) {
    return (
      <div>
        {label}
        {res.length ? res : <EmptyOutput />}
      </div>
    );
  } else if (type instanceof IDL.PrincipalClass) {
    return (
      <div>
        {label}
        {res.toText()}
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
