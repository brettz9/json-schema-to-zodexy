import { parseArray } from "../../src/parsers/parseArray.js";
import { suite } from "../suite.js";

suite("parseArray", (test) => {
  test("should create tuple with items array", (assert) => {
    assert(
      parseArray(
        {
          type: 'array',
          items: [
            {
              type: 'string'
            },
            {
              type: 'number'
            }
          ]
        },
        { path: [], seen: new Map() },
      ),
      `{"type": "tuple", "items": [{"type": "string"},{"type": "number"}]}`,
    );
  });

  test("should create array with items object", (assert) => {
    assert(
      parseArray(
        {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        { path: [], seen: new Map() },
      ),
      `{"type": "array", "element": {"type": "string"}}`,
    );
  });

  test("should create array with missing items object", (assert) => {
    assert(
      parseArray(
        {
          type: 'array'
        },
        { path: [], seen: new Map() },
      ),
      `{"type": "array", "element": {"type": "any"}}`,
    );
  });

  test("should create max for maxItems", (assert) => {
    assert(
      parseArray(
        {
          type: 'array',
          maxItems: 2,
          items: {
            type: 'string'
          }
        },
        { path: [], seen: new Map() },
      ),
      `{"type": "array", "element": {"type": "string"}, "maxLength": 2}`
    );
  });

  test("should create min for minItems", (assert) => {
    assert(
      parseArray(
        {
          type: 'array',
          minItems: 2,
          items: {
            type: 'string'
          }
        },
        { path: [], seen: new Map() },
      ),
      `{"type": "array", "element": {"type": "string"}, "minLength": 2}`
    );
  });

  // test("should add unique for uniqueItems", (assert) => {
  //   assert(
  //     parseArray(
  //       {
  //         type: 'array',
  //         uniqueItems: true,
  //         items: {
  //           type: 'string'
  //         }
  //       },
  //       { path: [], seen: new Map() },
  //     ),
  //     `{"type": "array", "element": {"type": "string"}}`,
  //   );
  // });
})
