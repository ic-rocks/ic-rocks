import { get } from "object-path-immutable";
import protobuf, { Field, Type } from "protobufjs";
import React, { useState } from "react";
import { stringify } from "../../lib/candid/utils";
import { pluralize } from "../../lib/strings";
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

export const PROTOBUF_OUTPUT_DISPLAYS = ["Pretty", "JSON", "Raw"] as const;
export type ProtobufOutputDisplay = typeof PROTOBUF_OUTPUT_DISPLAYS[number];

export const isNumberType = (name) =>
  name === "double" ||
  name === "float" ||
  name === "int32" ||
  name === "int64" ||
  name === "uint32" ||
  name === "uint64" ||
  name === "sint32" ||
  name === "sint64" ||
  name === "fixed32" ||
  name === "fixed64" ||
  name === "sfixed32" ||
  name === "sfixed64";

export const Message = ({
  objectName,
  type,
  path = [],
  isInput = false,
  inputs,
  errors,
  handleInput,
  outputs,
  display = PROTOBUF_OUTPUT_DISPLAYS[0],
}: {
  objectName?: string;
  type: Type | string;
  path?: (string | number)[];
  isInput?: boolean;
  inputs?: any;
  errors?: any;
  handleInput?: (value: any, path: any[]) => void;
  outputs?: any;
  display?: ProtobufOutputDisplay;
}) => {
  if (!isInput) {
    if (display === "JSON") {
      return <OutputWrapper force={true} value={stringify(outputs)} />;
    } else if (display === "Raw") {
      if (!(type instanceof Type)) {
        throw `type is ${type} but we expect full type`;
      }
      const raw = Buffer.from(type.encode(outputs).finish());
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
  }

  let description, contents;
  if (type instanceof Type) {
    if (!type.resolved) {
      // This is probably not the right way to do this
      type.resolveAll();
    }

    description =
      objectName != null ? `${objectName} (${type.name})` : type.name;
    const visibleFields = type.oneofsArray[0]
      ? type.oneofsArray[0].fieldsArray.filter(
          (field) => get(outputs, path.concat([field.name])) != null
        )
      : type.fieldsArray;
    if (isInput || visibleFields.length) {
      contents = visibleFields.map((field) => {
        return (
          <MessageField
            key={field.name}
            field={field}
            path={path.concat([field.name])}
            inputs={inputs}
            errors={errors}
            handleInput={handleInput}
            outputs={outputs}
            isInput={isInput}
          />
        );
      });
    } else {
      contents = <EmptyOutput />;
    }

    return (
      <Node
        nested={visibleFields.length > 0}
        label={<Label>{description}</Label>}
      >
        {contents}
      </Node>
    );
  } else {
    console.warn("Message is base type", objectName);
    description = objectName;

    if (!isInput && get(outputs, path) == null) {
      contents = <EmptyOutput />;
    }

    return <Node label={<Label>{description}</Label>}>{contents}</Node>;
  }
};

const MessageField = ({
  field,
  path = [],
  isInput = false,
  inputs,
  errors,
  handleInput,
  outputs,
  display = PROTOBUF_OUTPUT_DISPLAYS[0],
}: {
  field: Field;
  path?: (string | number)[];
  isInput?: boolean;
  inputs?: any;
  errors?: any;
  handleInput?: (value: any, path: any[]) => void;
  outputs?: any;
  display?: typeof PROTOBUF_OUTPUT_DISPLAYS[number];
}) => {
  const description = `${field.name} (${field.type})`;
  let label = <Label>{description}</Label>;

  if (field.resolvedType) {
    if (!field.repeated) {
      if (field.resolvedType instanceof protobuf.Enum) {
        label = (
          <Label>
            {field.name} (enum {field.type})
          </Label>
        );
        if (isInput) {
          const selected = get(inputs, path, 0);
          return (
            <Node label={label}>
              <select
                className="p-1 bg-gray-100 dark:bg-gray-800 cursor-pointer"
                onChange={(e) => handleInput(Number(e.target.value), path)}
                value={selected}
                required={field.required}
              >
                <option disabled>select {field.name}...</option>
                {Object.entries(field.resolvedType.values).map(
                  ([name, value]) => {
                    return (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    );
                  }
                )}
              </select>
            </Node>
          );
        } else {
          const enumValue = (field.resolvedType as protobuf.Enum).valuesById[
            get(outputs, path)
          ];
          if (enumValue == null) {
            return (
              <Node label={label}>
                <EmptyOutput />
              </Node>
            );
          }
          return (
            <Node label={label}>
              <OutputWrapper value={enumValue} />
            </Node>
          );
        }
      } else {
        return (
          <Message
            objectName={field.name}
            type={field.resolvedType as Type}
            path={path}
            inputs={inputs}
            errors={errors}
            handleInput={handleInput}
            outputs={outputs}
            isInput={isInput}
          />
        );
      }
    }
  }

  if (field.repeated) {
    label = (
      <Label>
        {field.name} (repeated {field.type})
      </Label>
    );
    if (isInput) {
      const vec = get(inputs, path, []);
      return (
        <Node label={label}>
          <ArrayInput
            array={vec}
            handleInput={handleInput}
            path={path}
            type={field.resolvedType as Type}
            inputs={inputs}
            errors={errors}
          />
        </Node>
      );
    } else {
      const array = get(outputs, path, []);
      return (
        <Node label={label}>
          {array.length ? (
            array.map((item, i) => (
              <Message
                key={i}
                type={
                  field.resolvedType ? (field.resolvedType as Type) : field.type
                }
                objectName={String(i)}
                path={path.concat([i])}
                inputs={inputs}
                errors={errors}
                handleInput={handleInput}
                outputs={outputs}
                isInput={isInput}
              />
            ))
          ) : (
            <EmptyOutput />
          )}
        </Node>
      );
    }
  }

  // base type
  let contents;
  if (isInput) {
    let inputType, min, max;
    if (field.type.startsWith("uint") || field.type.startsWith("fixed")) {
      inputType = "number";
      min = 0;
    } else if (
      field.type.startsWith("int") ||
      field.type.startsWith("sint") ||
      field.type.startsWith("sfixed")
    ) {
      inputType = "number";
    } else if (field.type === "bool") {
    } else if (field.type === "bytes") {
      const [encoding, setEncoding] = useState<typeof BUFFER_ENCODINGS[number]>(
        BUFFER_ENCODINGS[0]
      );
      return (
        <Node
          label={label}
          showButtons={true}
          buttons={
            <BufferEncodingButtons
              active={encoding}
              onChange={setEncoding}
              showRaw={false}
            />
          }
        >
          <BufferInput
            placeholder={description}
            onChange={(buf) => handleInput(buf, path)}
            encoding={encoding as BufferEncoding}
            value={get(inputs, path, Buffer.from([]))}
          />
        </Node>
      );
    } else {
      inputType = "text";
    }
    const value = get(inputs, path, "");
    const error = get(errors, path, null);
    contents = (
      <>
        <input
          placeholder={description}
          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-sm"
          type={inputType}
          onChange={(e) => handleInput(e.target.value, path)}
          value={value}
          required={field.required}
          min={min}
          max={max}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </>
    );
  } else {
    const value = get(outputs, path, null);
    if (value != null) {
      if (isNumberType(field.type)) {
        contents = <NumberDisplay argName={field.name} value={value} />;
      } else if (field.type === "bool") {
        contents = <OutputWrapper value={stringify(value)} />;
      } else if (field.type === "bytes") {
        return <BufferDisplay value={value} label={label} />;
      } else {
        return (
          <Node label={label}>
            <OutputWrapper value={stringify(value)} />
          </Node>
        );
      }
    } else {
      contents = <EmptyOutput />;
    }
  }

  return <Node label={label}>{contents}</Node>;
};
