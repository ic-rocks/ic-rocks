import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import protobuf from "protobufjs";
import { isNumberType } from "../../components/CanisterUI/ProtobufElements";
import { pluralize } from "../strings";

export const any = (arr: any[]): boolean =>
  arr.reduce((prev, curr) => prev || curr, false);

export const stringify = (data) =>
  JSON.stringify(
    data,
    (key, value) =>
      typeof value === "bigint"
        ? value.toString()
        : value instanceof Principal
        ? value.toText()
        : Buffer.isBuffer(value)
        ? value.toString("hex")
        : value,
    2
  );

export function getDefaultValue(type: IDL.Type) {
  if (type instanceof IDL.RecClass) {
    return getDefaultValue(type["_type"]);
  }
  if (type instanceof IDL.RecordClass) {
    if (type instanceof IDL.TupleClass) {
      return type["_fields"].map(([_, t]) => getDefaultValue(t));
    }

    const fields = type["_fields"];
    return Object.fromEntries(fields.map(([k, t]) => [k, getDefaultValue(t)]));
  } else if (type instanceof IDL.VecClass) {
    return [];
  } else if (type instanceof IDL.VariantClass) {
    return { [type["_fields"][0][0]]: getDefaultValue(type["_fields"][0][1]) };
  } else if (type instanceof IDL.OptClass) {
    return null;
  } else if (
    type instanceof IDL.TextClass ||
    type instanceof IDL.PrincipalClass ||
    type instanceof IDL.FixedNatClass ||
    type instanceof IDL.FixedIntClass
  ) {
    return "";
  } else if (type instanceof IDL.BoolClass) {
    return false;
  } else if (type instanceof IDL.NullClass) {
    return null;
  }
}

export function getShortname(type: IDL.Type): string {
  if (type instanceof IDL.RecClass) {
    return getShortname(type["_type"]);
  }
  if (type instanceof IDL.RecordClass) {
    const fields = type["_fields"];
    const recordOrTuple = type instanceof IDL.TupleClass ? "tuple" : "record";
    return `${recordOrTuple} {${fields.length} ${pluralize(
      "field",
      fields.length
    )}}`;
  }
  if (type instanceof IDL.VecClass) return `vec ${getShortname(type["_type"])}`;
  if (type instanceof IDL.VariantClass) {
    return `variant {${type["_fields"].length} ${pluralize(
      "field",
      type["_fields"].length
    )}}`;
  }
  if (type instanceof IDL.OptClass) return `opt ${getShortname(type["_type"])}`;
  return type?.name;
}

/**
 * Attempt to coerce an arbitrary input according to the desired type
 * @param type The candid or protobuf type
 * @param input The value
 * @returns A tuple of [coerced value, error]
 */
export const validate = (type: IDL.Type | protobuf.Type, input: any) =>
  type instanceof IDL.Type
    ? validateCandid(type, input)
    : validateProtobuf(type, input || {});

function validateProtobuf(
  type: protobuf.Type | string,
  input: any
): [any, any] {
  if (type instanceof protobuf.Type) {
    type.resolveAll();
    const fields = type.fieldsArray.filter(
      (field) => field.required || !!input[field.name]
    );
    if (fields.length) {
      const validated = fields.map((field) => {
        const type = field.resolvedType
          ? (field.resolvedType as protobuf.Type)
          : field.type;
        if (field.repeated && Array.isArray(input[field.name])) {
          const validated = input[field.name].map((item) =>
            validateProtobuf(type, item)
          );
          const errs = validated.map(([_, err]) => err);
          return [
            field.name,
            validated.map(([res]) => res),
            errs.some(Boolean) ? errs : null,
          ];
        }
        return [field.name, ...validateProtobuf(type, input[field.name])];
      });
      if (validated.some(([_, __, err]) => err)) {
        return [
          null,
          Object.fromEntries(validated.map(([name, _, err]) => [name, err])),
        ];
      } else {
        return [
          Object.fromEntries(validated.map(([name, res]) => [name, res])),
          null,
        ];
      }
    }

    const err = type.verify(input);
    return err ? [null, err] : [input, null];
  }

  // basic type
  if (type === "bytes")
    return [typeof input === "string" ? Buffer.from(input) : input, null];
  else if (isNumberType(type)) return [Number(input), null];
  else return [input, null];
}

function validateCandid(type: IDL.Type, input: any): [any, any] {
  if (type instanceof IDL.RecClass) {
    return validateCandid(type["_type"], input);
  }
  if (type instanceof IDL.RecordClass) {
    const inputOrDefault = input || getDefaultValue(type);
    if (type instanceof IDL.TupleClass) {
      if (Array.isArray(input)) {
        const validated = type["_fields"].map(([_, fieldType], i) =>
          validateCandid(fieldType, input[i])
        );
        const errs = validated.map(([_, err]) => err);
        return [
          validated.map(([res]) => res),
          errs.some(Boolean) ? errs : null,
        ];
      } else {
        const error = "invalid tuple";
        console.warn(error, inputOrDefault);
        return [null, error];
      }
    }

    const fields = type["_fields"];
    if (typeof inputOrDefault === "object") {
      const validated = {};
      const errors = {};
      let hasError = false;
      fields.forEach(([name, type]) => {
        const [res, err] = validateCandid(type, inputOrDefault[name]);
        validated[name] = res;
        hasError = hasError || err;
        err && (errors[name] = err);
      });
      return [validated, hasError ? errors : null];
    } else {
      const error = "invalid record";
      console.warn(error, inputOrDefault);
      return [null, error];
    }
  } else if (type instanceof IDL.VecClass) {
    if (Array.isArray(input)) {
      const validated = input
        .filter((arg) => arg !== undefined)
        .map((arg) => validateCandid(type["_type"], arg));
      const errs = validated.map(([_, err]) => err);
      return [validated.map(([res]) => res), errs.some(Boolean) ? errs : null];
    } else {
      return [[], null];
    }
  } else if (type instanceof IDL.VariantClass) {
    const inputOrDefault = input || getDefaultValue(type);
    if (typeof inputOrDefault === "object") {
      const [selectedName] = Object.keys(inputOrDefault);
      if (selectedName != undefined) {
        const [_, selectedType] = type["_fields"].find(
          ([name]) => name === selectedName
        );
        const [res, err] = validateCandid(
          selectedType,
          inputOrDefault[selectedName]
        );
        return err == null
          ? [{ [selectedName]: res }, null]
          : [null, { [selectedName]: err }];
      } else {
        const error = "invalid variant";
        console.warn(error, inputOrDefault);
        return [null, error];
      }
    } else {
      const error = "invalid variant";
      console.warn(error, inputOrDefault);
      return [null, error];
    }
  } else if (type instanceof IDL.OptClass) {
    if (!input) {
      return [[], null];
    } else {
      const [res, err] = validateCandid(type["_type"], input);
      return [err == null ? [res] : null, err];
    }
  } else if (type instanceof IDL.TextClass) {
    return [input || "", null];
  } else if (type instanceof IDL.PrincipalClass) {
    try {
      return [Principal.fromText(input), null];
    } catch (error) {
      return [null, error.message];
    }
  } else if (
    type instanceof IDL.FixedNatClass ||
    type instanceof IDL.FixedIntClass
  ) {
    try {
      BigInt(input);
    } catch (err) {
      console.warn(type, input, err);
      return [null, err.message];
    }
    return [BigInt(input), null];
  } else if (type instanceof IDL.BoolClass) {
    return [!!input, null];
  } else {
    try {
      type.encodeValue(input);
    } catch (err) {
      console.warn(type, input, err);
      return [null, err.message];
    }
  }
  return [input, null];
}
