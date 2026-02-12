import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      indent: ["error", 2, {
        SwitchCase: 1,
        VariableDeclarator: "first",
        outerIIFEBody: 1,
        FunctionDeclaration: { parameters: "first" },
        FunctionExpression: { parameters: "first" },
        CallExpression: { arguments: "first" },
        ArrayExpression: "first",
        ObjectExpression: "first",
        ImportDeclaration: "first",
        flatTernaryExpressions: false,
        ignoreComments: false,
      }],

      "react/jsx-indent": ["error", 2],
      "react/jsx-indent-props": ["error", 2],

      "no-mixed-spaces-and-tabs": "error",
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
