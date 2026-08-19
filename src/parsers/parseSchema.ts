import { parseAnyOf } from "./parseAnyOf.js";
import { parseBoolean } from "./parseBoolean.js";
import { parseDefault } from "./parseDefault.js";
import { parseMultipleType } from "./parseMultipleType.js";
import { parseNull } from "./parseNull.js";
import { parseAllOf } from "./parseAllOf.js";
import { parseArray } from "./parseArray.js";
import { parseConst } from "./parseConst.js";
import { parseEnum } from "./parseEnum.js";
import { parseNumber } from "./parseNumber.js";
import { parseObject } from "./parseObject.js";
import { parseString } from "./parseString.js";
import { parseOneOf } from "./parseOneOf.js";
import { parseSimpleDiscriminatedOneOf } from "./parseSimpleDiscriminatedOneOf.js";
import { parseNullable } from "./parseNullable.js";
import {
  ParserSelector,
  Refs,
  JsonSchemaObject,
  JsonSchema,
  Serializable,
  SimpleDiscriminatedOneOfSchema,
} from "../Types.js";

export const parseSchema = (
  schema: JsonSchema,
  refs: Refs = { seen: new Map(), path: [] },
  blockMeta?: boolean,
): string => {
  if (typeof schema !== "object") return schema ? `{"type": "any"}` : `{"type": "never"}`;

  if (refs.parserOverride) {
    const custom = refs.parserOverride(schema, refs);

    if (typeof custom === "string") {
      return custom;
    }
  }

  let seen = refs.seen.get(schema);

  if (seen) {
    if (seen.r !== undefined) {
      return seen.r;
    }
    if (refs.depth === undefined || seen.n >= refs.depth) {
      return `{"type": "any"}`;
    }

    seen.n += 1;
  } else {
    seen = { r: undefined, n: 0 };
    refs.seen.set(schema, seen);
  }

  let parsed = selectParser(schema, refs);
  if (!blockMeta) {
    if (!refs.withoutDescribes) {
      parsed = addMeta(schema, parsed);
    }

    if (!refs.withoutDefaults) {
      parsed = addDefaults(schema, parsed);
    }

    parsed = addAnnotations(schema, parsed)
  }

  seen.r = parsed;

  return parsed;
};

const addMeta = (schema: JsonSchemaObject, parsed: string): string => {
  if (Object.hasOwn(schema, 'title') || Object.hasOwn(schema, 'description') ||
   Object.hasOwn(schema, '$id') || Object.hasOwn(schema, 'deprecated')) {

    parsed = parsed.slice(0, -1) + `, "meta": {`;

    if (Object.hasOwn(schema, 'title')) {
      parsed += `"title": ${JSON.stringify(schema.title)},`;
    }

    if (Object.hasOwn(schema, 'description')) {
      parsed += `"description": ${JSON.stringify(schema.description)},`;
    }

    if (Object.hasOwn(schema, '$id')) {
      parsed += `"id": ${JSON.stringify(schema.$id)},`;
    }

    if (Object.hasOwn(schema, 'deprecated')) {
      parsed += `"deprecated": ${JSON.stringify(schema.deprecated)},`;
    }

    parsed = parsed.slice(0, -1) + '}}';
  }

  return parsed;
};

const addDefaults = (schema: JsonSchemaObject, parsed: string): string => {
  if (schema.default !== undefined) {
    parsed = parsed.slice(0, -1) + `, "defaultValue": ${JSON.stringify(schema.default)}}`;
  }

  return parsed;
};

const addAnnotations = (schema: JsonSchemaObject, parsed: string): string => {
  if (schema.readOnly) {
    parsed = parsed.slice(0, -1) + `, "readonly": true}`;
  }

  return parsed;
};

const selectParser: ParserSelector = (schema, refs) => {
  if (its.a.nullable(schema)) {
    return parseNullable(schema, refs);
  } else if (its.an.object(schema)) {
    return parseObject(schema, refs);
  } else if (its.an.array(schema)) {
    return parseArray(schema, refs);
  } else if (its.an.anyOf(schema)) {
    return parseAnyOf(schema, refs);
  } else if (its.an.allOf(schema)) {
    return parseAllOf(schema, refs);
  } else if (its.a.simpleDiscriminatedOneOf(schema)) {
    return parseSimpleDiscriminatedOneOf(schema, refs);
  } else if (its.a.oneOf(schema)) {
    return parseOneOf(schema, refs);
  } else if (its.an.enum(schema)) {
    return parseEnum(schema); //<-- needs to come before primitives
  } else if (its.a.const(schema)) {
    return parseConst(schema);
  } else if (its.a.multipleType(schema)) {
    return parseMultipleType(schema, refs);
  } else if (its.a.primitive(schema, "string")) {
    return parseString(schema);
  } else if (
    its.a.primitive(schema, "number") ||
    its.a.primitive(schema, "integer")
  ) {
    return parseNumber(schema);
  } else if (its.a.primitive(schema, "boolean")) {
    return parseBoolean(schema);
  } else if (its.a.primitive(schema, "null")) {
    return parseNull(schema);
  } else {
    return parseDefault(schema);
  }
};

export const its = {
  an: {
    object: (x: JsonSchemaObject): x is JsonSchemaObject & { type: "object" } =>
      x.type === "object",
    array: (x: JsonSchemaObject): x is JsonSchemaObject & { type: "array" } =>
      x.type === "array",
    anyOf: (
      x: JsonSchemaObject,
    ): x is JsonSchemaObject & {
      anyOf: JsonSchema[];
    } => x.anyOf !== undefined,
    allOf: (
      x: JsonSchemaObject,
    ): x is JsonSchemaObject & {
      allOf: JsonSchema[];
    } => x.allOf !== undefined,
    enum: (
      x: JsonSchemaObject,
    ): x is JsonSchemaObject & {
      enum: Serializable | Serializable[];
    } => x.enum !== undefined,
  },
  a: {
    nullable: (
      x: JsonSchemaObject,
    ): x is JsonSchemaObject & { nullable: true } =>
      (x as any).nullable === true,
    multipleType: (
      x: JsonSchemaObject,
    ): x is JsonSchemaObject & { type: string[] } => Array.isArray(x.type),
    const: (
      x: JsonSchemaObject,
    ): x is JsonSchemaObject & {
      const: Serializable;
    } => x.const !== undefined,
    primitive: <T extends "string" | "number" | "integer" | "boolean" | "null">(
      x: JsonSchemaObject,
      p: T,
    ): x is JsonSchemaObject & { type: T } => x.type === p,
    simpleDiscriminatedOneOf: (
      x: JsonSchemaObject,
    ): x is SimpleDiscriminatedOneOfSchema => {
      if (
        !x.oneOf ||
        !Array.isArray(x.oneOf) ||
        x.oneOf.length === 0 ||
        !x.discriminator ||
        typeof x.discriminator !== "object" ||
        !("propertyName" in x.discriminator) ||
        typeof x.discriminator.propertyName !== "string"
      ) {
        return false;
      }

      const discriminatorProp = x.discriminator.propertyName;

      return x.oneOf.every((schema) => {
        if (
          !schema ||
          typeof schema !== "object" ||
          schema.type !== "object" ||
          !schema.properties ||
          typeof schema.properties !== "object" ||
          !(discriminatorProp in schema.properties)
        ) {
          return false;
        }

        const property = schema.properties[discriminatorProp];
        return (
          property &&
          typeof property === "object" &&
          property.type === "string" &&
          // Ensure discriminator has a constant value (const or single-value enum)
          (property.const !== undefined ||
           (property.enum && Array.isArray(property.enum) && property.enum.length === 1)) &&
          // Ensure discriminator property is required
          Array.isArray(schema.required) &&
          schema.required.includes(discriminatorProp)
        );
      });
    },
    oneOf: (
      x: JsonSchemaObject,
    ): x is JsonSchemaObject & {
      oneOf: JsonSchema[];
    } => x.oneOf !== undefined,
  }
};
