import { Options, JsonSchema } from "./Types.js";
import { parseSchema } from "./parsers/parseSchema.js";
import { expandJsdocs } from "./utils/jsdocs.js";

export const jsonSchemaToZodexy = (
  schema: JsonSchema,
  { module, name, ...rest }: Options = {},
): string => {
  let result = parseSchema(schema, {
    module,
    name,
    path: [],
    seen: new Map(),
    ...rest,
  });

  result = `{"$zodexySchema": "https://github.com/brettz9/zodexy/releases/tag/v0.27.0", ` + result.slice(1)

  const jsdocs = rest.withJsdocs && typeof schema !== "boolean" && schema.description
    ? expandJsdocs(schema.description)
    : "";

  if (module === "cjs") {
    result = `${jsdocs}module.exports = ${name ? `{ ${JSON.stringify(name)}: ${result} }` : result}
`;

  } else if (module === "esm") {
    result = `${jsdocs}export ${name ? `const ${name} =` : `default`} ${result}
`;

  } else if (name) {
    result = `${jsdocs}const ${name} = ${result}`;
  }

  return result;
};
