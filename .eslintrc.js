module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:prettier/recommended"],
  plugins: ["react", "react-hooks", "prettier", "@typescript-eslint"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  settings: {
    react: {
      /* Tells eslint-plugin-react to automatically detect the version of React
				 to use. */
      version: "detect"
    }
  },
  /* I am not 100% sure that the node_modules are being ignored properly, hence
     the multiple references. */
  ignorePatterns: ["*.svg", "node_modules/**/*", "**/node_modules/**/*", "build", "dist", "public"],
  rules: {
    "prettier/prettier": "error",
    "no-global-assign": 2,
    "no-redeclare": "off", // Messes with function overloading.
    "no-restricted-globals": 2,
    quotes: [1, "double"],
    semi: [1, "always"],
    "no-tabs": [
      "error",
      {
        allowIndentationTabs: true
      }
    ],
    "no-unused-expressions": "warn",
    "no-multi-spaces": "warn",
    "no-trailing-spaces": "warn",
    "no-console": "off",
    "no-restricted-syntax": [
      "warn",
      {
        selector: "CallExpression[callee.object.name='console'][callee.property.name!=/^(warn|error|info)$/]",
        message: "This property on console is not allowed."
      }
    ],
    "no-eval": "warn",
    "object-curly-spacing": [1, "always"],
    "multiline-comment-style": ["warn", "bare-block"],
    "max-len": [
      "warn",
      {
        code: 120,
        tabWidth: 2,
        comments: 82,
        ignoreRegExpLiterals: true,
        ignorePattern: "^.*(eslint-disable|@ts-ignore).*"
      }
    ],
    "no-shadow": "off",
    "react/prop-types": ["off"],
    "react/react-in-jsx-scope": ["off"],
    "react/display-name": ["off"],
    "react/no-children-prop": ["off"],
    "react/jsx-curly-brace-presence": ["error", "always"],
    /* Note:  These non-typescript base rules have to be disabled as of TS
			 4.0.0 in order to prevent false positives.  The no-undef lint rule does
			 not use TypeScript to determine the global variables that exist -
			 instead, it relies upon ESLint's configuration - so it is strongly
			 recommended that it be turned off since TS will handle it anyways.
			 https://github.com/typescript-eslint/typescript-eslint/blob/master/
			 docs/getting-started/linting/FAQ.md#i-get-errors-from-the-no-undef-
			 rule-about-global-variables-not-being-defined-even-though-there-are-no-
			 typescript-errors */
    "no-use-before-define": "off",
    "no-undef": "off"
  },
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
      ],

      parserOptions: {
        project: ["./tsconfig.json"]
      },
      rules: {
        "@typescript-eslint/no-unsafe-assignment": ["off"],
        "@typescript-eslint/ban-ts-comment": ["off"],
        "@typescript-eslint/no-namespace": ["off"],
        "@typescript-eslint/no-unsafe-return": ["off"],
        "@typescript-eslint/no-use-before-define": ["error"],
        "@typescript-eslint/restrict-plus-operands": ["off"],
        "@typescript-eslint/no-shadow": ["error"],
        // Eventually, we want to turn the next two rules into warnings.
        "@typescript-eslint/explicit-module-boundary-types": ["off"],
        "@typescript-eslint/explicit-function-return-type": ["off"],
        /* It would be nice for this to be an error, but unfortunately AG Grid's
			     type bindings are so terrible that it makes it difficult. */
        "@typescript-eslint/no-unsafe-member-access": ["off"]
      }
    }
  ]
};
