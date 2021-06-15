import { IDL } from "@dfinity/candid";
import { useRouter } from "next/router";
import { get } from "object-path-immutable";
import React, { useState } from "react";
import {
  getDefaultValue,
  getShortname,
  stringify,
} from "../../lib/candid/utils";
import { isUrl, pluralize } from "../../lib/strings";
import {
  ArrayInput,
  BufferDisplay,
  BufferEncodingButtons,
  BufferInput,
  BUFFER_ENCODINGS,
  EmptyOutput,
  Label,
  Node,
  NumberDisplay,
  OutputWrapper,
} from "./Shared";

export const CANDID_OUTPUT_DISPLAYS = [
  "Pretty",
  "JSON",
  "Candid",
  "Raw",
] as const;
export type CandidOutputDisplay = typeof CANDID_OUTPUT_DISPLAYS[number];

export const CandidInput = ({
  argName,
  path = [],
  type,
  showLabel = true,
  inputs,
  errors,
  handleInput,
}: {
  argName?: string;
  path: (string | number)[];
  type: IDL.Type;
  showLabel?: boolean;
  inputs: any;
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
      <Node label={label} nested>
        {fields.map(([fieldName, fieldType], i) => (
          <CandidInput
            key={fieldName}
            type={fieldType}
            argName={isTuple ? i : fieldName}
            path={path.concat([isTuple ? i : fieldName])}
            inputs={inputs}
            errors={errors}
            handleInput={handleInput}
          />
        ))}
      </Node>
    );
  }

  if (type instanceof IDL.VecClass) {
    const vec = get(inputs, path, []);
    const isVecNat8 = type["_type"].name === "nat8";
    const [vecInput, setVecInput] = useState<typeof BUFFER_ENCODINGS[number]>(
      BUFFER_ENCODINGS[0]
    );
    return (
      <Node
        showButtons={isVecNat8}
        buttons={
          <BufferEncodingButtons active={vecInput} onChange={setVecInput} />
        }
        label={label}
      >
        {!isVecNat8 || vecInput === "Raw" ? (
          <ArrayInput
            array={vec}
            handleInput={handleInput}
            path={path}
            type={type["_type"]}
            inputs={inputs}
            errors={errors}
          />
        ) : (
          <BufferInput
            placeholder={description}
            onChange={(buf) => handleInput(Array.from(buf), path)}
            encoding={vecInput as BufferEncoding}
            value={Buffer.from(vec)}
          />
        )}
      </Node>
    );
  }

  if (type instanceof IDL.VariantClass) {
    const selected = get(inputs, path) || getDefaultValue(type);
    const selectedName = Object.keys(selected)[0];
    const selectedField = type["_fields"].find(
      ([name]) => name === selectedName
    );

    return (
      <Node label={showLabel && label}>
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
          <CandidInput
            type={selectedField[1]}
            argName={selectedName}
            path={path.concat([selectedName])}
            inputs={inputs}
            errors={errors}
            handleInput={handleInput}
          />
        )}
      </Node>
    );
  }

  if (type instanceof IDL.BoolClass) {
    return (
      <Node
        label={
          <Label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="mr-1"
              onChange={(e) => handleInput(e.target.checked, path)}
              checked={get(inputs, path, false)}
            />
            {description}
          </Label>
        }
      />
    );
  }

  if (type instanceof IDL.OptClass) {
    const checked = get(inputs, path, null);
    return (
      <Node
        label={
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
        }
      >
        {checked !== null && (
          <div className="pl-4">
            <CandidInput
              type={type["_type"]}
              path={path}
              showLabel={false}
              inputs={inputs}
              errors={errors}
              handleInput={handleInput}
            />
          </div>
        )}
      </Node>
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
    <Node label={showLabel && label}>
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
    </Node>
  );
};

export const CandidOutput = ({
  type,
  argName,
  value,
  showLabel = true,
  display = "Pretty",
}: {
  type: IDL.Type;
  argName?: string | number;
  value: any;
  showLabel?: boolean;
  display?: typeof CANDID_OUTPUT_DISPLAYS[number];
}) => {
  if (!type) {
    return <EmptyOutput />;
  }

  if (display === "Candid") {
    return (
      <OutputWrapper
        force={true}
        value={IDL.FuncClass.argsToString([type], [value])}
      />
    );
  } else if (display === "JSON") {
    return <OutputWrapper force={true} value={stringify(value)} />;
  } else if (display === "Raw") {
    let raw;
    try {
      raw = type.encodeValue(value);
    } catch (error) {
      console.warn("failed to decode", type, argName, value, error);
      raw = String(value);
    }
    return (
      <Node
        label={
          <Label>
            {raw.length} {pluralize("byte", raw.length)}
          </Label>
        }
      >
        <OutputWrapper force={true} value={"0x" + raw.toString("hex")} />
      </Node>
    );
  }

  const shortname = getShortname(type);
  const description = argName != null ? `${argName} (${shortname})` : shortname;
  const label = <Label>{description}</Label>;

  if (type instanceof IDL.VecClass) {
    const length = value.length;
    const lengthLabel = <Label className="ml-2">(len {length})</Label>;
    if (
      type["_type"] instanceof IDL.FixedNatClass ||
      type["_type"] instanceof IDL.FixedIntClass ||
      type["_type"] instanceof IDL.NatClass ||
      type["_type"] instanceof IDL.IntClass
    ) {
      if (type["_type"].name === "nat8") {
        return <BufferDisplay value={value} label={label} />;
      } else {
        return (
          <Node
            label={
              <>
                {label}
                {length > 0 && lengthLabel}
              </>
            }
          >
            {length ? (
              <OutputWrapper value={stringify(value)} />
            ) : (
              <EmptyOutput />
            )}
          </Node>
        );
      }
    } else {
      if (length) {
        return (
          <Node
            label={
              <>
                {label}
                {lengthLabel}
              </>
            }
            nested
          >
            {value.map((r, i) => (
              <CandidOutput
                key={i}
                type={type["_type"]}
                argName={i}
                value={r}
                display={display}
              />
            ))}
          </Node>
        );
      } else {
        return (
          <Node label={label}>
            <EmptyOutput />
          </Node>
        );
      }
    }
  } else if (type instanceof IDL.RecordClass || type instanceof IDL.RecClass) {
    const fields =
      type instanceof IDL.RecClass ? type["_type"]["_fields"] : type["_fields"];
    const isTuple = type instanceof IDL.TupleClass;
    return (
      <Node label={label} nested>
        {fields.map(([fieldName, fieldType], i) => {
          const key = isTuple ? i : fieldName;
          return (
            <div key={key}>
              <CandidOutput
                type={fieldType}
                argName={key}
                value={value[key]}
                display={display}
              />
            </div>
          );
        })}
      </Node>
    );
  } else if (type instanceof IDL.VariantClass) {
    const selectedName = Object.keys(value)[0];
    const selectedField = type["_fields"].find(
      ([name]) => name === selectedName
    );

    return (
      <Node label={showLabel && label}>
        <div>{selectedName}</div>
        {!(selectedField[1] instanceof IDL.NullClass) && (
          <CandidOutput
            type={selectedField[1]}
            argName={selectedName}
            value={value[selectedName]}
            display={display}
          />
        )}
      </Node>
    );
  } else if (type instanceof IDL.OptClass) {
    if (!value || value.length === 0) {
      return (
        <Node label={label}>
          <EmptyOutput />
        </Node>
      );
    } else {
      return (
        <Node label={label}>
          <CandidOutput
            type={type["_type"]}
            value={value[0]}
            showLabel={false}
            display={display}
          />
        </Node>
      );
    }
  } else if (
    type instanceof IDL.FixedNatClass ||
    type instanceof IDL.FixedIntClass ||
    type instanceof IDL.NatClass ||
    type instanceof IDL.IntClass
  ) {
    return (
      <Node label={label}>
        <NumberDisplay argName={argName} value={value} />
      </Node>
    );
  } else if (type instanceof IDL.TextClass) {
    return (
      <Node
        label={
          <>
            {label}
            {value.length > 0 && (
              <Label className="ml-2">(len {value.length})</Label>
            )}
          </>
        }
      >
        {value.length ? (
          isUrl(value) ? (
            <a
              href={value}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              {value}
            </a>
          ) : (
            <OutputWrapper value={value} />
          )
        ) : (
          <EmptyOutput />
        )}
      </Node>
    );
  } else if (type instanceof IDL.PrincipalClass) {
    const principal = value.toText();
    const router = useRouter();
    const { principalId } = router.query;
    return (
      <Node label={label}>
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
      </Node>
    );
  } else {
    return (
      <Node label={label}>
        <OutputWrapper value={stringify(value)} />
      </Node>
    );
  }
};
