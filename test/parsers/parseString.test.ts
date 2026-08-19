import { dezerialize } from "zodexy";
import { parseString } from "../../src/parsers/parseString";
import { suite } from "../suite";

suite("parseString", (test) => {
  test("email", (assert) => {
    assert(
      parseString({
        type: "string",
        format: "email",
      }),
      `{"type": "string", "kind": "email"}`,
    );
  });

  test("ip", (assert) => {
    assert(
      parseString({
        type: "string",
        format: "ip",
      }),
      `{"type": "string", "kind": "ip", "version": "v4"}`,
    );
    assert(
      parseString({
        type: "string",
        format: "ipv4",
      }),
      `{"type": "string", "kind": "ip", "version": "v4"}`,
    );
    assert(
      parseString({
        type: "string",
        format: "ipv6",
      }),
      `{"type": "string", "kind": "ip", "version": "v6"}`,
    );
  });

  test("uri", (assert) => {
    assert(
      parseString({
        type: "string",
        format: "uri",
      }),
      `{"type": "string", "kind": "url"}`,
    );
  });

  test("uuid", (assert) => {
    assert(
      parseString({
        type: "string",
        format: "uuid",
      }),
      `{"type": "string", "kind": "uuid"}`,
    );
  });

  test("time", (assert) => {
    assert(
      parseString({
        type: "string",
        format: "time",
      }),
      `{"type": "string", "kind": "time"}`,
    );
  });

  test("date", (assert) => {
    assert(
      parseString({
        type: "string",
        format: "date",
      }),
      `{"type": "string", "kind": "date"}`,
    );
  });

  test("date-time", (assert) => {
    assert(
      parseString({
        type: "string",
        format: "date-time",
      }),
      `{"type": "string", "kind": "datetime", "offset": true}`,
    );
  });

  test("duration", (assert) => {
    assert(
      parseString({
        type: "string",
        format: "duration",
      }),
      `{"type": "string", "kind": "duration"}`,
    );
  });

  test("base64", (assert) => {
    assert(
      parseString({
        type: "string",
        contentEncoding: "base64",
      }),
      `{"type": "string", "kind": "base64"}`,
    );

    assert(
      parseString({
        type: "string",
        format: "binary",
      }),
      `{"type": "string", "kind": "base64"}`,
    );
  });

  test("regex", (assert) => {
    assert(
      parseString({
        type: "string",
        pattern: ".*",
      }),
      `{"type": "string", "regex": ".*"}`,
    );
  });

  test("min", (assert) => {
    assert(
      parseString({
        type: "string",
        minLength: 15,
      }),
      `{"type": "string", "min": 15}`,
    );
  });

  test("max", (assert) => {
    assert(
      parseString({
        type: "string",
        maxLength: 20,
      }),
      `{"type": "string", "max": 20}`,
    );
  });
});
