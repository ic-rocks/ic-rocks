import { IDL } from "@dfinity/candid";
import * as leb128 from "@dfinity/candid/lib/cjs/utils/leb128";
import { Principal } from "@dfinity/principal";
import BufferPipe from "buffer-pipe";
import protobuf from "protobufjs";
import { isNumberType } from "../../components/CanisterUI/ProtobufElements";
import { pluralize } from "../strings";

const DIDC_BUFFER = Buffer.from("4449444c", "hex");

export const decodeBlob = (bytes: Buffer) => {
  const b =
    bytes.slice(0, 4).compare(DIDC_BUFFER) === 0 ? bytes.slice(4) : bytes;

  const pipe = new BufferPipe(b);
  const rawTable = [];
  const len = Number(leb128.lebDecode(pipe));
  for (let i = 0; i < len; i++) {
    const ty = Number(leb128.slebDecode(pipe));
    switch (ty) {
      case -18 /* Opt */:
      case -19 /* Vector */: {
        const t = Number(leb128.slebDecode(pipe));
        rawTable.push([ty, t]);
        break;
      }
      case -20 /* Record */:
      case -21 /* Variant */: {
        const fields = [];
        let objectLength = Number(leb128.lebDecode(pipe));
        let prevHash;
        while (objectLength--) {
          const hash = Number(leb128.lebDecode(pipe));
          if (hash >= Math.pow(2, 32)) {
            throw new Error("field id out of 32-bit range");
          }
          if (typeof prevHash === "number" && prevHash >= hash) {
            throw new Error("field id collision or not sorted");
          }
          prevHash = hash;
          const t = Number(leb128.slebDecode(pipe));
          fields.push([hash, t]);
        }
        rawTable.push([ty, fields]);
        break;
      }
      case -22 /* Func */: {
        for (let k = 0; k < 2; k++) {
          let funcLength = Number(leb128.lebDecode(pipe));
          while (funcLength--) {
            leb128.slebDecode(pipe);
          }
        }
        const annLen = Number(leb128.lebDecode(pipe));
        leb128.safeRead(pipe, annLen);
        rawTable.push([ty, undefined]);
        break;
      }
      case -23 /* Service */: {
        let servLength = Number(leb128.lebDecode(pipe));
        while (servLength--) {
          const l = Number(leb128.lebDecode(pipe));
          leb128.safeRead(pipe, l);
          leb128.slebDecode(pipe);
        }
        rawTable.push([ty, undefined]);
        break;
      }
      default:
        throw new Error("Illegal op_code: " + ty);
    }
  }
  const rawTypes = [];
  const length = Number(leb128.lebDecode(pipe));
  for (let i = 0; i < length; i++) {
    rawTypes.push(Number(leb128.slebDecode(pipe)));
  }
  const table = rawTable.map((_) => IDL.Rec());
  function getType(t) {
    if (t < -24) {
      throw new Error("future value not supported");
    }
    if (t < 0) {
      switch (t) {
        case -1:
          return IDL.Null;
        case -2:
          return IDL.Bool;
        case -3:
          return IDL.Nat;
        case -4:
          return IDL.Int;
        case -5:
          return IDL.Nat8;
        case -6:
          return IDL.Nat16;
        case -7:
          return IDL.Nat32;
        case -8:
          return IDL.Nat64;
        case -9:
          return IDL.Int8;
        case -10:
          return IDL.Int16;
        case -11:
          return IDL.Int32;
        case -12:
          return IDL.Int64;
        case -13:
          return IDL.Float32;
        case -14:
          return IDL.Float64;
        case -15:
          return IDL.Text;
        case -16:
          return IDL.Reserved;
        case -17:
          return IDL.Empty;
        case -24:
          return IDL.Principal;
        default:
          throw new Error("Illegal op_code: " + t);
      }
    }
    if (t >= rawTable.length) {
      throw new Error("type index out of range");
    }
    return table[t];
  }
  function buildType(entry) {
    switch (entry[0]) {
      case -19 /* Vector */: {
        const ty = getType(entry[1]);
        return IDL.Vec(ty);
      }
      case -18 /* Opt */: {
        const ty = getType(entry[1]);
        return IDL.Opt(ty);
      }
      case -20 /* Record */: {
        const fields = {};
        for (const [hash, ty] of entry[1]) {
          const name = `_${hash}_`;
          fields[name] = getType(ty);
        }
        const record = IDL.Record(fields);
        const tuple = record.tryAsTuple();
        if (Array.isArray(tuple)) {
          return IDL.Tuple(...tuple);
        } else {
          return record;
        }
      }
      case -21 /* Variant */: {
        const fields = {};
        for (const [hash, ty] of entry[1]) {
          const name = `_${hash}_`;
          fields[name] = getType(ty);
        }
        return IDL.Variant(fields);
      }
      case -22 /* Func */: {
        return IDL.Func([], [], []);
      }
      case -23 /* Service */: {
        return IDL.Service({});
      }
      default:
        throw new Error("Illegal op_code: " + entry[0]);
    }
  }
  rawTable.forEach((entry, i) => {
    const t = buildType(entry);
    table[i].fill(t);
  });
  const types = rawTypes.map((t) => getType(t));
  const output = types.map((t) => t.decodeValue(pipe, t));
  if (pipe.buffer.length > 0) {
    console.log("decode: Left-over bytes");
  }
  return { types, output };
};

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
