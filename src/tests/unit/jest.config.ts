import { withTypescriptConfig } from "../../../jest.config.base";

export default withTypescriptConfig(__dirname, {
  displayName: "Unit Tests",
  // Scope the tests that Jest will run to just tests in the `src/tests/unit` directory.
  testMatch: [`${__dirname}/**/*.test.ts`],
});
