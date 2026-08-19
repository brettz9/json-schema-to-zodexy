import { parseNumber } from "../../src/parsers/parseNumber.js";
import { suite } from "../suite.js";

suite("parseNumber", (test) => {
  test("should handle integer", (assert) => {
    assert(
      parseNumber({
        type: "integer",
      }),
      `{"type": "number", "format": "safeint"}`
    );

    assert(
      parseNumber({
        type: "integer",
        multipleOf: 1
      }),
      `{"type": "number", "format": "safeint"}`
    );

    assert(
      parseNumber({
        type: "number",
        multipleOf: 1
      }),
      `{"type": "number", "format": "safeint"}`
    );

    assert(
      parseNumber({
        type: "integer",
        multipleOf: 2
      }),
      `{"type": "number", "format": "safeint", "multipleOf": 2}`
    );
  });

  test("should handle minimum with exclusiveMinimum", (assert) => {
    assert(
      parseNumber({
        type: "number",
        exclusiveMinimum: true,
        minimum: 2,
      }),
      `{"type": "number", "min": 2}`
    );
  });

  test("should handle exclusiveMinimum without minimium", (assert) => {
    assert(
      parseNumber({
        type: "number",
        exclusiveMinimum: 2,
      }),
      `{"type": "number", "min": 2}`
    );
  });

  test("should handle minimum without exclusiveMinimum", (assert) => {
    assert(
      parseNumber({
        type: "number",
        minimum: 2,
      }),
      `{"type": "number", "min": 2, "minInclusive": true}`
    );
  });

  test("should handle maximum with exclusiveMaximum", (assert) => {
    assert(
      parseNumber({
        type: "number",
        exclusiveMaximum: true,
        maximum: 2,
      }),
      `{"type": "number", "max": 2}`
    );
  });

  test("should handle maximum without exclusiveMaximum", (assert) => {
    assert(
      parseNumber({
        type: "number",
        maximum: 2,
      }),
      `{"type": "number", "max": 2, "maxInclusive": true}`
    );
  });

  test("should handle numeric exclusiveMaximum", (assert) => {
    assert(
      parseNumber({
        type: "number",
        exclusiveMaximum: 2,
      }),
      `{"type": "number", "max": 2}`
    );
  });
});
