import { parseOneOf } from "../../src/parsers/parseOneOf.js";
import { suite } from "../suite.js";

suite("parseOneOf", (test) => {
  test("should extract a single schema", (assert) => {
    assert(
      parseOneOf(
        { oneOf: [{ type: "string" }] },
        { path: [], seen: new Map() },
      ),
      `{"type": "string"}`,
    );
  });

  test("should return z.any() if array is empty", (assert) => {
    assert(
      parseOneOf({ oneOf: [] }, { path: [], seen: new Map() }),
      `{"type": "any"}`
    );
  });
});
