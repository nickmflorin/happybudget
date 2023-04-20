import { z } from "zod";

import { model, schemas } from "lib";

export type Order = 1 | -1 | 0;

export type DefinitiveOrder = 1 | -1;

export type FieldOrder<F extends string = string> = {
  readonly field: F;
  readonly order: Order;
};

export type Ordering<F extends string = string> = FieldOrder<F>[];

export type ModelOrderableField<M extends model.ApiModel> = Exclude<keyof M, "id"> & string;

export type ModelFieldOrder<M extends model.ApiModel> = FieldOrder<ModelOrderableField<M>>;

export type ModelOrdering<M extends model.ApiModel> = ModelFieldOrder<M>[];

const FieldOrderSchema = z
  .object({
    field: z.string().nonempty().toLowerCase(),
    order: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
  })
  .strict();

export type QueryParamValue = string | number | boolean;
export type RawQueryParamValue<F extends string = string> =
  | QueryParamValue
  | undefined
  | null
  | Ordering<F>
  | number[]
  | string[];

export type RawQuery<F extends string = string> = Record<string, RawQueryParamValue<F>>;
export type ProcessedQuery = Record<string, QueryParamValue>;

export type ListQuery = {
  readonly search?: string;
};

export type ApiModelListQuery<M extends model.ApiModel = model.ApiModel> = ListQuery & {
  readonly ordering?: ModelOrdering<M>;
  readonly ids?: number[];
  readonly exclude?: number[];
  readonly simple?: boolean;
  readonly page_size?: number;
  readonly page?: number;
};

function getQueryOrderingSchema<F extends string = string>(
  fields: F[],
): z.ZodArray<z.ZodType<FieldOrder<F>>>;

function getQueryOrderingSchema(fields?: undefined): z.ZodArray<z.ZodType<FieldOrder<string>>>;

function getQueryOrderingSchema<F extends string = string>(
  fields?: F[] | undefined,
): z.ZodArray<z.ZodType<FieldOrder<string>>> | z.ZodArray<z.ZodType<FieldOrder<F>>> {
  if (fields && fields.length !== 0) {
    let schema: z.ZodType<FieldOrder<F>>;
    if (fields && fields.length > 2) {
      schema = FieldOrderSchema.extend({
        field: z.enum(fields as [F, F, ...F[]]),
      }) as z.ZodType<FieldOrder<F>>;
    } else {
      schema = FieldOrderSchema.extend({
        field: z.literal(fields[0]),
      }) as z.ZodType<FieldOrder<F>>;
    }
    return z.array(schema);
  }
  return z.array(FieldOrderSchema);
}

export function safeQueryOrdering<F extends string = string>(
  param: unknown,
  fields: F[],
): Ordering<F>;

export function safeQueryOrdering(param: unknown): Ordering<string>;

export function safeQueryOrdering<F extends string = string>(
  param: unknown,
  fields?: F[],
): Ordering<F> | Ordering<string> {
  if (fields) {
    const schema = getQueryOrderingSchema(fields);
    schemas.assertObjectOfType<Ordering<string>>(param, schema);
    return param;
  }
  const schema = getQueryOrderingSchema();
  schemas.assertObjectOfType<Ordering<string>>(param, schema);
  return param;
}

export function queryParamIsOrdering<F extends string = string>(
  param: unknown,
  fields: F[],
): param is Ordering<F>;

export function queryParamIsOrdering(param: unknown): param is Ordering<string>;

export function queryParamIsOrdering<F extends string = string>(
  param: unknown,
  fields?: F[],
): param is Ordering<F> | Ordering<string> {
  if (fields) {
    const schema = getQueryOrderingSchema(fields);
    return schemas.isObjectOfType<Ordering<F>>(param, schema) !== false;
  }
  const schema = getQueryOrderingSchema();
  return schemas.isObjectOfType<Ordering<string>>(param, schema) !== false;
}
