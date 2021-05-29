import { IDL, Principal } from "@dfinity/agent";
import { pluralize } from "../pluralize";

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
  if (type instanceof IDL.RecordClass || type instanceof IDL.RecClass) {
    if (type instanceof IDL.TupleClass) {
      return type["_fields"].map(([_, t]) => getDefaultValue(t));
    }

    const fields =
      type instanceof IDL.RecClass ? type["_type"]["_fields"] : type["_fields"];
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
  if (type instanceof IDL.RecordClass || type instanceof IDL.RecClass) {
    const fields =
      type instanceof IDL.RecClass ? type["_type"]["_fields"] : type["_fields"];
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
  return type.name;
}

/**
 * Attempt to coerce an arbitrary input according to the desired type
 * @param type The type
 * @param input The value
 * @returns A tuple of [coerced value, error]
 */
export function validate(type: IDL.Type, input: any): [any, any] {
  if (type instanceof IDL.RecordClass || type instanceof IDL.RecClass) {
    const inputOrDefault = input || getDefaultValue(type);
    if (type instanceof IDL.TupleClass) {
      if (Array.isArray(input)) {
        const validated = type["_fields"].map(([_, fieldType], i) =>
          validate(fieldType, input[i])
        );
        const errs = validated.map(([_, err]) => err);
        return [validated.map(([res]) => res), any(errs) ? errs : null];
      } else {
        const error = "invalid tuple";
        console.warn(error, inputOrDefault);
        return [null, error];
      }
    }

    const fields =
      type instanceof IDL.RecClass ? type["_type"]["_fields"] : type["_fields"];
    if (typeof inputOrDefault === "object") {
      const validated = {};
      const errors = {};
      let hasError = false;
      fields.forEach(([name, type]) => {
        const [res, err] = validate(type, inputOrDefault[name]);
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
      const validated = input.map((arg) => validate(type["_type"], arg));
      const errs = validated.map(([_, err]) => err);
      return [validated.map(([res]) => res), any(errs) ? errs : null];
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
        const [res, err] = validate(selectedType, inputOrDefault[selectedName]);
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
      const [res, err] = validate(type["_type"], input);
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
    return [Number(input), null];
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
