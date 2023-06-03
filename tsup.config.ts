import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outDir: "lib",
  dts: true,
  sourcemap: true,
  clean: true,
});
