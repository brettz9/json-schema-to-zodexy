import { Options, JsonSchema } from "../src/Types.js";
import { jsonSchemaToZodexy as jstoz } from "../src/jsonSchemaToZodexy.js";
import { expandJsdocs } from "../src/utils/jsdocs.js";

const schemaURL = "https://github.com/brettz9/zodexy/releases/tag/v0.27.0";

/**
 * We strip off the expected initial export text and the schema URL so our test
 *   expectations don't need to include the schema URL.
 */
export const jsonSchemaToZodexy = (
  schema: JsonSchema,
  opts: Options = {},
): string => {
  const { module, name, ...rest } = opts;
  const jsdocs = rest.withJsdocs && typeof schema !== "boolean" && schema.description
    ? expandJsdocs(schema.description)
    : "";
  let result;

  if (module === "cjs") {
    const prefix = name
      ? `${jsdocs}module.exports = { ${JSON.stringify(name)}: {`
      : `${jsdocs}module.exports = {`;
    result = prefix + jstoz(schema, opts).slice(
      `${prefix}"$zodexySchema": "${schemaURL}", `.length
    );

  } else if (module === "esm") {
    const prefix = `${jsdocs}export ${name ? `const ${name} =` : `default`} {`;
    result = prefix + jstoz(schema, opts).slice(
      `${prefix}"$zodexySchema": "${schemaURL}", `.length
    );

  } else if (name) {
    const prefix = `${jsdocs}const ${name} = {`;
    result = prefix + jstoz(schema, opts).slice(
      `${prefix}"$zodexySchema": "${schemaURL}", `.length
    );
  } else {
    result = "{" + jstoz(schema, opts).slice(`{"$zodexySchema": "${schemaURL}", `.length);
  }

  return result;
};
