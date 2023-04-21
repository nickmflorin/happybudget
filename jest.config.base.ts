import nextJest from "next/jest";

import type { Config } from "jest";

const createNextJestConfig = nextJest({
  /*
  Provide the path to your Next.js app to load next.config.js and .env files in your test
  environment
  */
  dir: "./",
});

/**
 * A function that returns the base Jest configuration {@link Config} values for all "project"(s)
 * in the application.
 *
 * Note: Root Dir
 * --------------
 * The Jest configuration string placeholder, <rootDir>, refers to the root directory where the
 * project's Jest configuration file (jest-*.config.ts or jest.config.ts) is located - not the
 * root directory of the repository or the root directory that Jest is configured with via the
 * `rootDir` option.
 *
 * For cases where the actual repository root directory is required, the __dirname variable should
 * be used (only in this file or other root `jest-*.config.ts` files), and individual projects
 * will need to provide the __dirname to these methods.
 */
const createBaseConfig = (
  rootDir: string,
  mergeOverrides?: { testPathIgnorePatterns?: undefined | string[] },
): Config => ({
  rootDir,
  /* Provide the `prettierPath` so that it is always referencing the same version of Prettier. The
     default `prettierPath` is "prettier" - which can incidentally point to locally installed or
     other conflicting versions. */
  prettierPath: `${__dirname}/node_modules/.bin/prettier`,
  testEnvironment: "jest-environment-jsdom",
  globalSetup: `${__dirname}/src/application/support/global-test-setup.ts`,
  // This is required to support absolute imports in tests.
  moduleDirectories: [`${__dirname}/node_modules`, `${__dirname}/src`, `${__dirname}/src/style`],
  // Jest does not let us exclude `js` as a `moduleFileExtension` - the others make sense.
  moduleFileExtensions: ["ts", "js", "tsx", "scss"],
  testPathIgnorePatterns: [
    `${__dirname}/node_modules/`,
    `${__dirname}/src/deprecated/`,
    `${__dirname}/.next/`,
    ...(mergeOverrides?.testPathIgnorePatterns || []),
  ],
});

/**
 * Returns the {@link Config} values that define the base Jest configuration for all "project"(s)
 * in the application with project-scoped overrides included.
 *
 * A Jest "project" is defined as a subset of tests that require separate or modified
 * configurations.  These projects are associated with scoped configuration files, with are denoted
 * as either jest-*.config.ts or jest.config.ts.
 *
 * NextJS's configuration values - which are included via the {@link withNextConfig} method below -
 * should be applicable for almost every "project" (jest-*.config.ts or jest.config.ts), except
 * SASS unit tests.  As such, all other "projects" should use the {@link withNextConfig}.
 *
 * @param {string} rootDir
 *   The root directory of the project which contains the tests it is responsible for.  This should
 *   be provided by the __dirname variable inside of the project's `jest.config.ts`.
 *
 * @param {Config} config
 *   Additional Jest configuration options specific to that project.
 */
export const withBaseConfig = (
  rootDir: string,
  { testPathIgnorePatterns, ...config }: Config,
): Config => ({
  ...createBaseConfig(rootDir, { testPathIgnorePatterns }),
  ...config,
});

/**
 * Returns an async function that Jest will use to establish the configuration for a given
 * "project".  The provided configuration {@link Config} is merged into the base Jest configuration
 * {@link BaseJestConfig}, with the provided configuration values overriding.
 *
 * A Jest "project" is defined as a subset of tests that require separate or modified
 * configurations.  See the {@link withBaseConfig} method above for more context related to the
 * `rootDir` of a Jest "project".
 *
 * @param {string} rootDir
 *   The root directory of the project which contains the tests it is responsible for.  This should
 *   be provided by the __dirname variable inside of the project's `jest.config.ts`.
 *
 * @param {Config} config
 *   Additional Jest configuration options specific to that project.
 */
export const withNextConfig = (rootDir: string, config: Config) =>
  createNextJestConfig(withBaseConfig(rootDir, config));

/**
 * Returns an async function that Jest will use to establish the configuration for a given
 * "project" that is testing `.ts` or `.tsx` files.  The provided configuration {@link Config} is
 * merged into the base Jest configuration, {@link BaseJestConfig}, with the provided configuration
 * values overriding.
 *
 * @param {string} rootDir
 *   The root directory of the project which contains the tests it is responsible for.  This should
 *   be provided by the __dirname variable inside of the project's `jest.config.ts`.
 *
 * @param {Config} config
 *   Additional Jest configuration options specific to that project.
 */
export const withTypescriptConfig = (
  rootDir: string,
  { testPathIgnorePatterns, ...config }: Config,
): Config => ({
  ...createBaseConfig(rootDir, { testPathIgnorePatterns }),
  ...config,
  setupFilesAfterEnv: [
    ...(config.setupFilesAfterEnv || []),
    "./src/application/support/global-ts-test-setup.ts",
    "jest-expect-message",
  ],
});
