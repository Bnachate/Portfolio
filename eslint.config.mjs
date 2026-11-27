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

  // Application code: every parameter and every return type is written, `any` is forbidden.
  // Tests keep type inference (mocks and assertions would get very verbose).
  {
    files: ["app/**/*.{ts,tsx}", "server/**/*.ts", "scripts/**/*.ts", "proxy.ts"],
    rules: {
      "@typescript-eslint/typedef": ["error", {
        parameter: true,
        arrowParameter: true,
        memberVariableDeclaration: true,
        propertyDeclaration: true,
      }],
      "@typescript-eslint/explicit-function-return-type": ["error", {
        allowExpressions: false,
        allowTypedFunctionExpressions: true,
      }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
