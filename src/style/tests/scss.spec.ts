/*
The SASS Jest "project" is configured via the `jest.config.ts` file located in
`src/styles/__tests__/jest.config.ts`.  This configuration file points to only this `scss.spec.ts`
file via `testMatch` - because when Jest runs the test described in this file, that test is
responsible for actually running the tests, using "sass-true", across the testable SASS files in
this directory.

This file should only ever contain one test - the test that is responsible for using "sass-true"
to run the testable files in this directory.
*/
import path from "path";

import glob from "glob";
import { runSass } from "sass-true";

/* The SASS Jest "project" scopes the `rootDir` of the project's configuration to this directory
   in `src/styles/__tests__/jest.config.ts` - so the glob pattern will only look at files in this
   directory. */
const testPath = "**/*test.scss";

describe("SASS", () => {
  const sassTestFiles = glob.sync(path.resolve(process.cwd(), testPath));
  sassTestFiles.forEach((file: string) =>
    runSass(
      /* Provide the "sass-true" engine the `describe` and `it` Jest methods, such that it can
         turn them into SASS mixins. */
      { describe, it },
      file,
    ),
  );
});
