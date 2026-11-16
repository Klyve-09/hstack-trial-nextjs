import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Next 15 keeps tsconfig "jsx" at "preserve", so tell the test transform to compile JSX.
  oxc: { jsx: { runtime: "automatic" } },
  test: { environment: "jsdom", setupFiles: ["./src/test-setup.ts"] },
});
