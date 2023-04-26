import { z } from "zod";

import * as errors from "application/errors";

const JsonLiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type JsonLiteral = z.infer<typeof JsonLiteralSchema> | ArrayBuffer;

export type JsonObject = Record<string, Json>;
export type Json = JsonLiteral | { [key: string]: Json } | Json[];

export const JsonObjectSchema: z.ZodType<JsonObject> = z.lazy(() => z.record(JsonLiteralSchema));

export const JsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([JsonLiteralSchema, z.array(JsonLiteralSchema), z.record(JsonLiteralSchema)]),
);

type IsObjectOfTypeOptions = {
  readonly aware?: true;
};

type IsObjectOfTypeRT<P, O extends IsObjectOfTypeOptions> = O extends { readonly aware: true }
  ? [true, P] | [false, z.ZodError<P>]
  : boolean;

export const isObjectOfType = <P, O extends IsObjectOfTypeOptions = IsObjectOfTypeOptions>(
  obj: unknown,
  schema: z.ZodType<P>,
  options?: O,
): IsObjectOfTypeRT<P, O> => {
  const result = schema.safeParse(obj);
  if (result.success) {
    return (options?.aware === true ? [true, obj as P] : true) as IsObjectOfTypeRT<P, O>;
  } else if (options?.aware === true) {
    return [false, result.error] as IsObjectOfTypeRT<P, O>;
  }
  return false as IsObjectOfTypeRT<P, O>;
};

export type ParseObjectResponse<P> =
  | { error?: undefined; data: P }
  | { error: errors.MalformedDataSchemaError; data?: undefined };

export type ObjectParserOptions = {
  readonly prefix?: string;
};

export const parseObjectOfType = <P>(
  obj: unknown,
  schema: z.ZodType<P>,
  options?: ObjectParserOptions,
): ParseObjectResponse<P> => {
  const result = schema.safeParse(obj);
  if (result.success) {
    return { data: result.data, error: undefined };
  }
  return {
    error: new errors.MalformedDataSchemaError({
      value: obj,
      error: result.error,
      prefix: options?.prefix,
    }),
    data: undefined,
  };
};

type AssertObjectOfType = {
  <P>(value: unknown, schema: z.ZodSchema<P>, options?: ObjectParserOptions): asserts value is P;
};

export const assertObjectOfType: AssertObjectOfType = <P>(
  obj: unknown,
  schema: z.ZodSchema<P>,
  options?: ObjectParserOptions,
): asserts obj is P => {
  const { error } = parseObjectOfType<P>(obj, schema, options);
  if (error) {
    throw error;
  }
};
