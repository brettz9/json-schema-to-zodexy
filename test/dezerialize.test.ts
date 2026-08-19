import { dezerialize } from "zodexy";
import { jsonSchemaToZodexy } from "./jsonSchemaToZodexy.js";
import { suite } from "./suite.js";

suite("dezerialize", (test) => {
  test("is usable I guess", (assert) => {
    const zodSchema = dezerialize(
      JSON.parse(jsonSchemaToZodexy({ type: "string" })),
    );

    assert(zodSchema.safeParse("Testing"), {
      success: true,
      data: "Testing",
    });
  });
});
