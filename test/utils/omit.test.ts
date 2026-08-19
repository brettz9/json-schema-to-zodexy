import { omit } from "../../src/utils/omit.js";
import { suite } from "../suite.js";

suite("omit", (test) => {
  test("omit", (assert) => {
    const input = {
      a: true,
      b: true,
    };

    omit(
      input,
      "b",
      // @ts-expect-error
      "c",
    );

    const output = omit(input, "b");

    // @ts-expect-error
    output.b;

    assert(output.a, true);

    // @ts-expect-error
    assert(output.b, undefined);
  });
});
