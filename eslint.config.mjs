import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Same rule sets as the former .eslintrc.json ("next/core-web-vitals", "next/typescript"), in ESLint 9's flat format.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // New in eslint-config-next 16 (not in the 14 config this replaces). Kept as warnings so they stay visible:
    // - set-state-in-effect flags the deliberate pattern of reading this device's saved settings and progress
    //   after mount, which keeps server and browser renders identical; changing it is a behaviour change for
    //   its own pull request, not part of a security upgrade.
    // - preserve-manual-memoization is advice for the React Compiler, which this project does not use.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "next-env.d.ts", "content/sources/**"]),
]);
