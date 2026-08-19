import { parseNullable, parseSchema } from "../../src/index.js";
import { suite } from "../suite.js";

suite("parseNullable", (test) => {
  test("parseSchema should not add default twice", (assert) => {
    assert(
      parseSchema(
        {
          type: "string",
          nullable: true,
          default: null
        },
        { path: [], seen: new Map() },
      ),
      `{"type": "string", "isNullable": true, "defaultValue": null}`,
    );
  });
});
