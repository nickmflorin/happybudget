/*
Performs setup that is required for the testing of components or logic in `.ts` or `.tsx` files.
*/

// These lines fix the error: "ReferenceError: TextEncoder is not defined"
import { TextEncoder } from "util";

/*
The `@testing-library/jest-dom/extend-expect` package is required such that the
`@testing-library/react` type bindings are present on the Jest test-related functions, methods and
general assertions.
*/
import "@testing-library/jest-dom/extend-expect";

global.TextEncoder = TextEncoder;
