import { z } from "zod";

import { formatters } from "../util";

type IsObjectOfTypeOptions = {
  readonly aware?: true;
};

type IsObjectOfTypeRT<P, O extends IsObjectOfTypeOptions> = O extends { readonly aware: true }
  ? [true, P] | [false, z.ZodError<P>]
  : P | false;

export const isObjectOfType = <P, O extends IsObjectOfTypeOptions = IsObjectOfTypeOptions>(
  obj: unknown,
  schema: z.ZodSchema<P>,
  options?: O,
): IsObjectOfTypeRT<P, O> => {
  const result = schema.safeParse(obj);
  if (result.success) {
    return (options?.aware === true ? [true, obj as P] : (obj as P)) as IsObjectOfTypeRT<P, O>;
  } else if (options?.aware === true) {
    return [false, result.error] as IsObjectOfTypeRT<P, O>;
  }
  return false as IsObjectOfTypeRT<P, O>;
};

export const ensureObjectOfType = <P>(obj: unknown, schema: z.ZodSchema<P>): P => {
  const [success, result] = isObjectOfType(obj, schema, { aware: true });
  if (success) {
    return result;
  }
  throw new TypeError(
    "The object does not conform to the expected schema: \n" +
      formatters.stringifyZodIssues(result.issues),
  );
};
