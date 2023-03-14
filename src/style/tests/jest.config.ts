import { withBaseConfig } from "../../../jest.config.base";

/**
 * The Jest configuration {@link jest.Config} that should be used for SASS unit tests.
 *
 * These configurations do not (and cannot) use the async function that {@link withNextConfig}
 * returns - which is inconsistent with every other Jest "project" in the application.  This is
 * because NextJS's configurations do not work with the SASS unit testing framework, "sass-true",
 * so we instead have to use the {@link withBaseConfig} method.
 *
 * SASS unit tests require that the Jest test environment is "node" - not "jest-environment-jsdom",
 * which is why the configuration for this project will always have to be separate.
 */
const SassJestConfig = withBaseConfig(__dirname, {
  displayName: "SASS Unit Tests",
  // SASS unit tests require a "node" test environment to function properly.
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  /* Here, the actual SASS tests are being run by "sass-true" inside of the `scss.spec.ts` file,
     that uses a glob pattern to find the SASS test files.  We do not want to provide those files
     to Jest in the testMatch here, because they will try to run SASS files without "sass-true"
     and will not be able to transform the file.

     For "sass-true" to work, we have to manually apply the package on SASS files ourselves - which
     is done in the `scss.spec.ts` file.  That is the only file we want Jest to pick up via the
     `testMatch` - and "sass-true" will take care of the rest inside of that `.spec.ts` file.
     */
  testMatch: [`${__dirname}/scss.spec.ts`],
});

export default SassJestConfig;
