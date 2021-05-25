import { Rhum } from "https://deno.land/x/rhum@v1.1.10/mod.ts";
import { hasFileExtension } from "../utils.ts";

Rhum.testPlan("utils.test.ts", () => {
  Rhum.testSuite("hasFileExtension()", () => {
    Rhum.testCase("should validate a filename correctly", () => {
      Rhum.asserts.assertEquals(hasFileExtension("mod.ts", "ts"), true);
      Rhum.asserts.assertEquals(hasFileExtension("mod.ts", "js"), false);
      Rhum.asserts.assertEquals(hasFileExtension("mod", "ts"), false);
      Rhum.asserts.assertEquals(hasFileExtension("mod", "tsx"), false);
      Rhum.asserts.assertEquals(hasFileExtension("mod.ts", "jsx"), false);
    });
  });
});

Rhum.run();
