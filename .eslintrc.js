/*
Non-language specific extensions that should be used for all files in the application.  If
additional extensions are added, they need to go after `next/core-web-vitals` but before `prettier`.

The "next/core-web-vitals" base configuration is stricter than the less strict base configuration
"next".  The "next/core-web-vitals" includes "eslint-plugin-react", "eslint-plugin-react-hooks"
and "eslint-plugin-next" - along with other less notable plugins such as eslint-plugin-import.

See https://nextjs.org/docs/basic-features/eslint for more information.
*/
const EXTENSIONS = ["next/core-web-vitals", "prettier"];

const modifyExtensions = (...insert) =>
  insert === undefined ? EXTENSIONS : [EXTENSIONS[0], ...insert, ...EXTENSIONS.slice(1)];

const GENERIC_INTERNAL_MODULE_GROUP = ["api", "application", "lib", "internal", "store", "config"];
const COMPONENT_INTERNAL_MODULE_GROUP = ["app", "components", "style"];
const INTERNAL_MODULES = [...GENERIC_INTERNAL_MODULE_GROUP, ...COMPONENT_INTERNAL_MODULE_GROUP];

const pathGroupPattern = packages =>
  `{${packages.reduce((prev, v) => [...prev, `${v}`, `${v}/**`], []).join(",")}}`;

const IMPORT_ORDER_CONFIG = {
  groups: ["builtin", "external", "type", "internal", "parent", "sibling", "index", "object"],
  "newlines-between": "always",
  warnOnUnassignedImports: true,
  distinctGroup: false,
  pathGroupsExcludedImportTypes: ["react", "next"],
  pathGroups: [
    {
      pattern: pathGroupPattern(["react", "next", "react-dom"]),
      group: "builtin",
      position: "before",
    },
    {
      // Keep external UI and component related imports separate from generic external imports.
      pattern: pathGroupPattern(["antd", "@ag-grid-*", "@fortawesome", "@nivo"]),
      group: "external",
      position: "after",
    },
    {
      pattern: "{../*}",
      group: "parent",
      position: "after",
    },
    {
      pattern: "{./*}",
      group: "sibling",
      position: "after",
    },
    {
      pattern: pathGroupPattern(GENERIC_INTERNAL_MODULE_GROUP),
      group: "internal",
      position: "before",
    },
    {
      pattern: pathGroupPattern(COMPONENT_INTERNAL_MODULE_GROUP),
      group: "internal",
      position: "before",
    },
  ],
  alphabetize: {
    order: "asc",
    caseInsensitive: true,
    orderImportKind: "asc",
  },
};

const RESTRICTED_IMPORT_PATTERNS = [
  {
    group: ["lib/*", "!lib/compat"],
    message: "Imports from lib must use namespaces.",
  },
  {
    group: ["internal/*"],
    message: "Imports from internal must use namespaces.",
  },
  {
    group: ["components/*/*"],
    message: "Components must be imported from modules.",
  },
  {
    /* Importing from root level modules with relative imports (i.e. "../components" or "../lib")
       is not allowed as it can lead to circular imports. */
    group: INTERNAL_MODULES.reduce((prev, v) => [...prev, `../${v}`, `../*/${v}`], []),
    message:
      "When outside of the module, absolute imports must be used to import from that module.",
  },
];

/* The non-language specific rules that apply to all files in the application, regardless of file
   type or language. */
const BASE_RULES = {
  quotes: [1, "double"],
  semi: [1, "always"],
  "object-curly-spacing": [1, "always"],
  "multiline-comment-style": ["warn", "bare-block"],
  "max-len": [
    "warn",
    {
      code: 100,
      comments: 100,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      ignorePattern: "\\/\\*\\s+eslint-disable-next-line(.?)+\\*\\/$",
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
  "no-console": "error",
  "import/order": ["error", IMPORT_ORDER_CONFIG],
  "no-restricted-imports": ["error", { patterns: RESTRICTED_IMPORT_PATTERNS }],
  "react/display-name": "off",
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
  ignorePatterns: ["next-env.d.ts", "!.*", "package.json", "package-lock.json"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: modifyExtensions("plugin:@typescript-eslint/recommended"),
      rules: TS_BASE_RULES,
    },
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/tests/utils/*"],
      extends: modifyExtensions("plugin:@typescript-eslint/recommended"),
      rules: {
        ...TS_BASE_RULES,
        // In tests, we need to use var-requires quite often when mocking.
        "@typescript-eslint/no-var-requires": 0,
        /* Importing from components or lib without using a namespace is often times necessary in
           tests because the test is testing a function or component that is not exported outside
           of the module in a namespace because it is not needed outside of the module.  */
        "no-restricted-imports": ["error", { patterns: RESTRICTED_IMPORT_PATTERNS.slice(3) }],
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
