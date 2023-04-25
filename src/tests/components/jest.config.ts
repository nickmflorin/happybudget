import { withTypescriptConfig } from "../../../jest.config.base";

export default withTypescriptConfig(__dirname, {
  displayName: "Component Tests",
  // Scope the tests that Jest will run to just tests in the `src/tests/components` directory.
  testMatch: [`${__dirname}/**/?(*.)+(spec|test).(ts|tsx)`],
});
