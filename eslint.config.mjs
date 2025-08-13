import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/__tests__/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        ...globals.node, // Adds __dirname, __filename, process, etc.
        ...globals.jest,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "import/no-unresolved": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "newline-before-return": "error",

      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
];

// module.exports = {
//   root: true,
//   env: {
//     node: true,
//     es2020: true,
//     jest: true,
//   },
//   extends: ["eslint:recommended", "@typescript-eslint/recommended"],
//   parser: "@typescript-eslint/parser",
//   plugins: ["@typescript-eslint"],
//   parserOptions: {
//     ecmaVersion: 2020,
//     sourceType: "module",
//   },
//   rules: {
//     "import/no-unresolved": "error",
//     "@typescript-eslint/explicit-function-return-type": "off",
//     "@typescript-eslint/explicit-module-boundary-types": "off",
//     "@typescript-eslint/no-explicit-any": "warn",
//     "@typescript-eslint/no-unused-vars": "error",
//     "prefer-const": "error",
//     "no-var": "error",
//     "newline-before-return": "error",

//     "import/order": [
//       "warn",
//       {
//         groups: [
//           "builtin",
//           "external",
//           "internal",
//           "parent",
//           "sibling",
//           "index",
//           "object",
//           "type",
//         ],
//         "newlines-between": "always",
//       },
//     ],
//   },
//   ignorePatterns: ["dist/", "node_modules/", "*.js"],
// };
