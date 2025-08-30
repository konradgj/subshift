import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/packages/**/*.test.ts", "test/apps/**/*.test.ts"],
    exclude: ["**/dist/**", "node_modules/**"],
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      exclude: ["**/dist/**", "node_modules/**", "**/*.js"],
      include: ["apps/**", "packages/**"],
    },
  },
});
