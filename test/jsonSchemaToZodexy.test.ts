import {
  JSONSchema4,
  JSONSchema6Definition,
  JSONSchema7Definition,
} from "json-schema";
import jsonSchemaToZodexy from "../src";
import { suite } from "./suite";

suite("jsonSchemaToZodexy", (test) => {
  test("should accept json schema 7 and 4", (assert) => {
    const schema = { type: "string" } as unknown;

    assert(jsonSchemaToZodexy(schema as JSONSchema4));
    assert(jsonSchemaToZodexy(schema as JSONSchema6Definition));
    assert(jsonSchemaToZodexy(schema as JSONSchema7Definition));
  });

  test("should produce a string of JS code with JSDocs", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
          description: "The description"
        },
        { module: "esm", withJsdocs: true },
      ),
      `/**The description*/
export default {"type": "string", "description": "The description"}
`,
      true
    );
  });

  test("should produce a string of JS code with multiline JSDocs", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
          description: "The\ndescription"
        },
        { module: "esm", withJsdocs: true },
      ),
      `/**
* The
* description
*/
export default {"type": "string", "description": "The\\ndescription"}
`,
      true
    );
  });

  test("should produce a string of JS code creating a Zod schema from a simple JSON schema", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
        },
        { module: "esm" },
      ),
      `export default {"type": "string"}
`,
      true
    );
  });

  test("should include defaults", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
          default: "foo",
        },
        { module: "esm" },
      ),
      `export default {"type": "string", "defaultValue": "foo"}
`,
      true
    );
  });

  test("should include falsy defaults", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
          default: "",
        },
        { module: "esm" },
      ),
      `export default {"type": "string", "defaultValue": ""}
`,
      true
    );
  });

  test("should include falsy defaults", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
          const: "",
        },
        { module: "esm" },
      ),
      `export default {"type": "literal", "values": [""]}
`,
      true
    );
  });

  test("can exclude defaults", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
          default: "foo",
        },
        { module: "esm", withoutDefaults: true },
      ),
      `export default {"type": "string"}
`,
      true
    );
  });

  test("should include descriptions", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
          description: "foo",
        },
        { module: "esm" },
      ),
      `export default {"type": "string", "description": "foo"}
`,
      true
    );
  });

  test("can exclude describes", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "string",
          description: "foo",
        },
        { module: "esm", withoutDescribes: true },
      ),
      `export default {"type": "string"}
`,
      true
    );
  });

  test("will remove optionality if default is present", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "object",
          properties: {
            prop: {
              type: "string",
              default: "def",
            },
          },
        },
        { module: "esm" },
      ),
      `export default {"type": "object", "properties": {"prop": {"type": "string", "defaultValue": "def"}}}
`,
      true
    );
  });

  test("will handle falsy defaults", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "boolean",
          default: false,
        },
        { module: "esm" },
      ),
      `export default {"type": "boolean", "defaultValue": false}
`,
      true
    );
  });

  test("will ignore undefined as default", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          type: "null",
          default: undefined,
        },
        { module: "esm" },
      ),
      `export default {"type": "null"}
`,
      true
    );
  });

  test("should be possible to define a custom parser", (assert) => {
    assert(
      jsonSchemaToZodexy(
        {
          allOf: [
            { type: "string" },
            { type: "number" },
            { type: "boolean", description: "foo" },
          ],
        },
        {
          // module: false,
          parserOverride: (schema, refs) => {
            if (
              refs.path.length === 2 &&
              refs.path[0] === "allOf" &&
              refs.path[1] === 2 &&
              schema.type === "boolean" &&
              schema.description === "foo"
            ) {
              return "myCustomZodSchema";
            }
          },
        },
      ),

      `{"type": "intersection", "left": {"type": "string"}, "right": {"type": "intersection", "left": {"type": "number"}, "right": myCustomZodSchema}}`,
      true
    );
  });

  test("can output with cjs and a name", (assert) => {
    assert(jsonSchemaToZodexy({
      type: "string"
    }, { module: "cjs", name: "someName" }),
    `module.exports = { "someName": {"type": "string"} }
`, true);
  });

  test("can output with esm and a name", (assert) => {
    assert(jsonSchemaToZodexy({
      type: "string"
    }, { module: "esm", name: "someName" }),
    `export const someName = {"type": "string"}
`, true);
  });

  test("can output with cjs and no name", (assert) => {
    assert(jsonSchemaToZodexy({
      type: "string"
    }, { module: "cjs" }),
    `module.exports = {"type": "string"}
`, true);
  });

  test("can output with name only", (assert) => {
    assert(jsonSchemaToZodexy({
      type: "string"
    }, { name: "someName" }), `const someName = {"type": "string"}`, true);
  });

  test("can exclude name", (assert) => {
    assert(jsonSchemaToZodexy(true), `{"type": "any"}`);
  });
});
