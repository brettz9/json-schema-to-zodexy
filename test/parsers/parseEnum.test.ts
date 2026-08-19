import { parseEnum } from "../../src/parsers/parseEnum.js";
import { suite } from "../suite.js";

suite("parseEnum", (test) => {
  test("should create never with empty enum", (assert) => {
    assert(
      parseEnum(
        {
          enum: []
        },
      ),
      `{"type": "never"}`,
    );
  });

  test("should create literal with single item enum", (assert) => {
    assert(
      parseEnum(
        {
          enum: ["someValue"]
        },
      ),
      `{"type": "literal", "values": ["someValue"]}`,
    );
  });

  test("should create enum array with string enums", (assert) => {
    assert(
      parseEnum(
        {
          enum: ["someValue", "anotherValue"]
        },
      ),
      `{"type": "enum", "values": {"someValue": "someValue", "anotherValue": "anotherValue"}}`,
    );
  });
  test("should create union with mixed enums", (assert) => {
    assert(
      parseEnum(
        {
          enum: ["someValue", 57]
        },
      ),
      `{"type": "union", "options": [{"type": "literal", "values": ["someValue"]}, {"type": "literal", "values": [57]}]}`,
    );
  });
});
