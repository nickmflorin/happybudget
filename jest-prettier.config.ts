import { withLintConfig } from "./jest-lint.config";

export default withLintConfig(__dirname, {
  displayName: "Prettier",
  runner: "jest-runner-prettier",
});
