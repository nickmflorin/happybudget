import nextJest from "next/jest";

import type { Config } from "jest";

// Jest configuration options that are allowed to be overridden on a per-project basis.
type AllowedConfig = Omit<
  Config,
  | "rootDir"
  | "prettierPath"
  | "globalSetup"
  | "preset"
  | "transform"
  | "moduleDirectories"
  | "moduleFileExtensions"
>;

type DynamicConfig = AllowedConfig | ((repoRootDir: string) => AllowedConfig);

const getConfig = (c?: DynamicConfig): Config | undefined =>
  typeof c === "function" ? c(__dirname) : c;

const createNextJestConfig = nextJest({
  /*
  Provide the path to your Next.js app to load next.config.js and .env files in your test
  environment
  */
  dir: "./",
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
 * SASS unit tests.  As such, all other "projects" should use the {@link withNextConfig} (or an
 * appropriate extension).
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
 *
 * @param {string} rootDir
 *   The root directory of the project which contains the tests it is responsible for.  This should
 *   be provided by the __dirname variable inside of the project's `jest.config.ts`.
 *
 * @param {DynamicConfig} config
 *   Optional, additional Jest configuration options (or a function returning additional Jest
 *   configuration options) specific to that project.
 */
export const withBaseConfig = (rootDir: string, config?: DynamicConfig): Config => ({
  rootDir,
  /* Provide the `prettierPath` so that it is always referencing the same version of Prettier. The
     default `prettierPath` is "prettier" - which can incidentally point to locally installed or
     other conflicting versions. */
  prettierPath: `${__dirname}/node_modules/.bin/prettier`,
  testEnvironment: "jest-environment-jsdom",
  globalSetup: `${__dirname}/src/application/support/global-test-setup.ts`,
  preset: "ts-jest",
  // This is required to support absolute imports in tests.
  moduleDirectories: [`${__dirname}/node_modules`, `${__dirname}/src`, `${__dirname}/src/style`],
  // Jest does not let us exclude `js` as a `moduleFileExtension` - the others make sense.
  moduleFileExtensions: ["ts", "js", "tsx", "scss"],
  ...getConfig(config),
  testPathIgnorePatterns: [
    `${__dirname}/node_modules/`,
    `${__dirname}/.next/`,
    `${__dirname}/src/deprecated/`,
    ...(getConfig(config)?.testPathIgnorePatterns || []),
  ],
});

/**
 * Returns an async function that Jest will use to establish the configuration for a given
 * "project" which includes NextJS configuration options.  The provided configuration options
 * {@link DynamicConfig} are merged into the base Jest configuration {@link BaseJestConfig}, with
 * \the provided configuration values overriding.
 *
 * @param {string} rootDir
 *   The root directory of the project which contains the tests it is responsible for.  This should
 *   be provided by the __dirname variable inside of the project's `jest.config.ts`.
 *
 * @param {DynamicConfig} config
 *   Optional, additional Jest configuration options (or a function returning additional Jest
 *   configuration options) specific to that project.
 */
export const withNextConfig = (rootDir: string, config: DynamicConfig) =>
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
 * @param {DynamicConfig} config
 *   Optional, additional Jest configuration options (or a function returning additional Jest
 *   configuration options) specific to that project.
 */
export const withTypescriptConfig = (rootDir: string, config: DynamicConfig) =>
  withNextConfig(rootDir, {
    ...getConfig(config),
    setupFilesAfterEnv: [
      ...(getConfig(config)?.setupFilesAfterEnv || []),
      `${__dirname}/src/application/support/global-ts-test-setup.ts`,
      "jest-expect-message",
    ],
  });
