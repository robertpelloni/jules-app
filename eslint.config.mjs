<<<<<<< HEAD
import { defineConfig } from "eslint/config";
=======
import { defineConfig, globalIgnores } from "eslint/config";
>>>>>>> origin/fix-remove-debug-logs-16472708773165476071
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
<<<<<<< HEAD
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "external/**",
      "jules-sdk-reference/**"
    ]
  }
=======
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
>>>>>>> origin/fix-remove-debug-logs-16472708773165476071
]);

export default eslintConfig;
