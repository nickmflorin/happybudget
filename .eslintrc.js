/*
Non-language specific extensions that should be used for all files in the application.  If
additional extensions are added, they need to go after `next/core-web-vitals` but before `prettier`.
Includes Next.js' base ESLint configuration along with a stricter Core Web Vitals rule-set.  The
"next/core-web-vitals" base configuration is stricter than the less strict base configuration
"next".  The "next/core-web-vitals" includes "eslint-plugin-react", "eslint-plugin-react-hooks"
and "eslint-plugin-next".
See https://nextjs.org/docs/basic-features/eslint for more information.
*/
const EXTENSIONS = ["next/core-web-vitals", "prettier"];

const modifyExtensions = (...insert) =>
  insert === undefined ? EXTENSIONS : [EXTENSIONS[0], ...insert, ...EXTENSIONS.slice(1)];

// const FIRST_INTERNAL_MODULE_GROUP = ["api", "lib", "store", "config", "style"];

// // Components and styles should always be the last absolute imports.
// const SECOND_INTERNAL_MODULE_GROUP = ["app", "components", "tabling", "styles"];

// const INTERNAL_MODULES = [...FIRST_INTERNAL_MODULE_GROUP, ...SECOND_INTERNAL_MODULE_GROUP];

// /* Configuration for the 'import/order' ESLint rule.
//    Note that eslint-plugin-import is provided for us out of the box via 'next/core-web-vitals'. */
// const IMPORT_ORDER_CONFIG = {
//   groups: [["builtin", "external"], "type", "internal", ["parent", "sibling"], "index", "object"],
//   "newlines-between": "always",
//   warnOnUnassignedImports: true,
//   pathGroupsExcludedImportTypes: ["react", "next"],
//   pathGroups: [
//     {
//       pattern: "{react,next,next/**}",
//       group: "builtin",
//       position: "before",
//       distinctGroup: false,
//     },
//     /* Defining relative imports in the manner established by the next two pathGroups allows us to
//        treat them as being apart of the same group but still be ordered based on parent child
//        relationships. */
//     {
//       pattern: "{../*}",
//       group: "sibling",
//       position: "before",
//       distinctGroup: false,
//     },
//     {
//       pattern: "{./*}",
//       group: "sibling",
//       position: "after",
//       distinctGroup: false,
//     },
//     {
//       pattern: `{${FIRST_INTERNAL_MODULE_GROUP.reduce(
//         (prev, v) => [...prev, `${v}`, `${v}/**`],
//         [],
//       ).join(",")}}`,
//       group: "internal",
//       position: "before",
//       distinctGroup: false,
//     },
//     {
//       pattern: `{${SECOND_INTERNAL_MODULE_GROUP.reduce(
//         (prev, v) => [...prev, `${v}`, `${v}/**`],
//         [],
//       ).join(",")}}`,
//       group: "internal",
//       position: "before",
//       distinctGroup: false,
//     },
//   ],
//   alphabetize: {
//     order: "asc",
//     caseInsensitive: true,
//   },
// };

// const RESTRICTED_IMPORT_PATTERNS = [
//   {
//     group: ["lib/*", "!lib/support", "!lib/compat"],
//     message: "Imports from lib must use namespaces.",
//   },
//   {
//     group: ["components/*/*"],
//     message: "Components must be imported from modules.",
//   },
//   {
//     /* Importing from root level modules with relative imports (i.e. "../components" or "../lib")
//        is not allowed as it can lead to circular imports. */
//     group: INTERNAL_MODULES.reduce((prev, v) => [...prev, `../${v}`, `../*/${v}`], []),
//     message: "When outside of the module, absolute imports must be used for the directory.",
//   },
//   {
//     group: ["prisma/generated"],
//     message: "Imports from Prisma generated files are not allowed.",
//   },
// ];

/* The non-language specific ESLint and/or Prettier rules that apply to all files in the
   application, regardless of file type or language. */
const BASE_RULES = {
  quotes: [1, "double"],
  semi: [1, "always"],
  "object-curly-spacing": [1, "always"],
  "multiline-comment-style": ["warn", "bare-block"],
  "max-len": [
    "warn",
    {
      code: 120,
      comments: 100, // Prettier will "generally strive" to wrap code but not comments at 100
      tabWidth: 2,
      ignoreUrls: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      ignorePattern: "^\\/\\* eslint-disable-next-line(.?)+ \\*\\/$",
    },
  ],
  "prefer-const": "error",
  "arrow-body-style": ["error", "as-needed"],
  "no-unexpected-multiline": "error",
  curly: "error",
  "no-multiple-empty-lines": "error",
  "import/no-unresolved": "error",
  "import/no-duplicates": "error",
  "import/newline-after-import": ["error"],
  "import/no-useless-path-segments": ["error", { noUselessIndex: true }],
  // "import/order": ["error", IMPORT_ORDER_CONFIG],
  // "no-restricted-imports": ["error", { patterns: RESTRICTED_IMPORT_PATTERNS }],
  "no-console": "off",
  "no-restricted-syntax": [
    "warn",
    {
      selector:
        "CallExpression[callee.object.name='console'][callee.property.name!=/^(warn|error|info)$/]",
      message: "This property on console is not allowed.",
    },
  ],
};

const TS_BASE_RULES = {
  ...BASE_RULES,
  /* The no-unused-vars rule does not properly function with Typescript so we need to disable it in
     favor of the @typescript-eslint version. */
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": ["error"],
  /* The `no-explicit-any` rule sometimes does not play nicely with TS when trying to define general
     forms of types that require a generic type argument or array structures.  By specifying
     `ignoreRestArgs`, we can at least get it to play more nicely when spreading an arbitrary set of
     arguments that a function type can expect to receive. */
  "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
  "react/jsx-newline": [1, { prevent: true }],
  "react/jsx-curly-brace-presence": [1, { props: "never", children: "never" }],
};

module.exports = {
  extends: EXTENSIONS,
  rules: BASE_RULES,
  // The "!.*" is included such that ESLint doesn't (by default) ignore files that start with ".".
  ignorePatterns: ["!.*", "package.json", "package-lock.json"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: modifyExtensions("plugin:@typescript-eslint/recommended"),
      rules: TS_BASE_RULES,
    },
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/utils/*"],
      extends: modifyExtensions("plugin:@typescript-eslint/recommended"),
      rules: {
        ...TS_BASE_RULES,
        // In tests, we need to use var-requires quite often when mocking.
        "@typescript-eslint/no-var-requires": 0,
        /* Importing from components or lib without using a namespace is often times necessary in
           tests because the test is testing a function or component that is not exported outside
        //    of the module in a namespace because it is not needed outside of the module.  */
        // "no-restricted-imports": ["error", { patterns: RESTRICTED_IMPORT_PATTERNS.slice(2) }],
      },
    },
    {
      files: ["**/*.md"],
      extends: EXTENSIONS,
      rules: {
        ...BASE_RULES,
        // This rule allows the formatter to automatically wrap text in markdown files at line 100.
        "prettier/prose-wrap": "error",
      },
    },
  ],
};
