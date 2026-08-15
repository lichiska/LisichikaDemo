import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "client", "public", "assets"),
    },
  },
  test: {
    environment: "node",
    include: ["client/**/*.test.ts", "worker/**/*.test.ts"],
  },
});
