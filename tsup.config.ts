import { defineConfig } from "tsup"

export default defineConfig({
  tsconfig: "./tsconfig.json",
  entry: ["./src/index.ts"],
  format: ["cjs", "esm"],
  treeshake: true,
  dts: true,
  sourcemap: true,
  clean: true,
})
