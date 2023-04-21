import { withLintConfig } from "./jest-lint.config";

export default withLintConfig(__dirname, {
  displayName: "ESLint",
  runner: "jest-runner-eslint",
  // Prettier works on scss files, but ESLint does not.
  testMatch: ["!**/*.scss"],
  testPathIgnorePatterns: [`!${__dirname}/src/styles/jest.config.ts`, `${__dirname}/src/styles/`],
});
