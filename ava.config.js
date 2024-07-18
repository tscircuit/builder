export default {
  files: ["tests/**/*.test.ts"],
  extensions: ["ts"],
  require: ["esbuild-register", "./tests/fixtures/setup-debug-logging.ts"],
  ignoredByWatcher: [".next", ".nsm"],
}
