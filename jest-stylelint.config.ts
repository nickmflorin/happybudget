import { withNextConfig } from "./jest.config.base";

export default withNextConfig(__dirname, {
  displayName: "Stylelint",
  runner: "jest-runner-stylelint",
  testMatch: ["/**/*.scss", "./**/*.module.scss", "./**/*.css", "./**/*.module.css"],
});
