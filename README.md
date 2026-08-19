# json-schema-to-zodexy

[![NPM Version](https://img.shields.io/npm/v/json-schema-to-zodexy.svg)](https://npmjs.org/package/json-schema-to-zodexy)
[![NPM Downloads](https://img.shields.io/npm/dw/json-schema-to-zodexy.svg)](https://npmjs.org/package/json-schema-to-zodexy)

## Summary

A runtime package and CLI tool to convert JSON schema (draft 4+) objects or files into Zodexy schemas.

This is a fork of [json-schema-to-zod](https://github.com/StefanTerdell/json-schema-to-zod) which seeks to allow dynamic evaluation without the need for `eval`. It is more recently a fork of [json-schema-to-zodex](https://github.com/brettz9/json-schema-to-zodex), with the rename being for the sake of reflecting its support for the maintained fork [zodexy](https://github.com/brettz9/zodexy) over [zodex](https://github.com/commonbaseapp/zodex).

**Note that with the ability to convert to Zodexy JSON, some of the export options are no longer relevant and have been removed.** The original project adds procedural code for cases which Zodexy does not handle out of the box (e.g., for multiple `oneOf` or conditionals), so if you
need such features, you may need to rely on the original project.

_Looking for the opposite? Check out [zod-to-json-schema](https://npmjs.org/package/zod-to-json-schema)_

## Usage

### CLI

#### Simplest example

```console
npm i -g json-schema-to-zodexy
```

```console
json-schema-to-zodexy -i mySchema.json -o mySchema.ts
```

#### Example with `$refs` resolved and output formatted

```console
npm i -g json-schema-to-zodexy json-refs prettier
```

```console
json-refs resolve mySchema.json | json-schema-to-zodexy | prettier --parser typescript > mySchema.ts
```

#### Options

| Flag           | Shorthand | Function                                                                                       |
| -------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `--input`      | `-i`      | JSON or a source file path. Required if no data is piped.                                      |
| `--output`     | `-o`      | A file path to write to. If not supplied stdout will be used.                                  |
| `--name`       | `-n`      | The name of the schema in the output                                                           |
| `--depth`      | `-d`      | Maximum depth of recursion in schema before falling back to `z.any()`. Defaults to 0.          |
| `--module`     | `-m`      | Module syntax; `esm`, `cjs` or none. Defaults to `esm` in the CLI and `none` programmaticly.   |
| `--withJsdocs` | `-wj`     | Generate jsdocs off of the description property.                                               |

### Programmatic

#### Simple example

```typescript
import { jsonSchemaToZodexy } from "json-schema-to-zodexy";

const myObject = {
  type: "object",
  properties: {
    hello: {
      type: "string",
    },
  },
};

// `type` can be either a string or - outside of the CLI - a boolean. If its `true`, the name of the type will be the name of the schema with a capitalized first letter.

const justTheSchema = jsonSchemaToZodexy(myObject);
```

#### Example with `$refs` resolved and output formatted

```typescript
import { z } from "zod";
import { resolveRefs } from "json-refs";
import { format } from "prettier";
import jsonSchemaToZodexy from "json-schema-to-zodexy";

async function example(jsonSchema: Record<string, unknown>): Promise<string> {
  const { resolved } = await resolveRefs(jsonSchema);
  const code = jsonSchemaToZodexy(resolved);
  const formatted = await format(code, { parser: "typescript" });

  return formatted;
}
```

#### Overriding a parser

You can pass a function to the `parserOverride` option, which represents a function that receives the current schema node and the reference object, and should return a string when it wants to replace a default output. If the default output should be used for the node just return void.

#### Schema factoring

Factored schemas (like object schemas with "oneOf" etc.) is only partially supported. Here be dragons.

#### Use at Runtime

JSON Schema and Zod does not overlap 100% and the scope of the parsers are purposefully limited in order to help the author avoid a permanent state of chaotic insanity. As this may cause some details of the original schema to be lost in translation, it is instead recommended to use tools such as [Ajv](https://ajv.js.org/) to validate your runtime values directly against the original JSON Schema.
