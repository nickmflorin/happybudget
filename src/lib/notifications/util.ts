import { inspect } from "util";

/**
 * Safely converts an object with potential circular references to JSON for
 * logging, which avoids potential circular references errors in our logs
 * as the `inspect` package will replace circular references with [Circular].
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const objToJson = (e: any) => {
  try {
    return JSON.stringify(inspect(e));
  } catch (err: unknown) {
    return "Error converting to JSON.";
  }
};
