type AssertNotNull<T> = (value: T) => asserts value is NonNullable<T>;

export const assertNotNullOrUndefined: AssertNotNull<unknown> = <T>(v: T) => {
  if (v === null || v === undefined) {
    throw new TypeError("Value should not be null or undefined!");
  }
};

type AssertNull = (value: unknown) => asserts value is null;

export const assertNull: AssertNull = (v: unknown): asserts v is null => {
  if (v !== null) {
    throw new TypeError("Value should be null!");
  }
};

export const assertNever = (value: never): never => {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
};
