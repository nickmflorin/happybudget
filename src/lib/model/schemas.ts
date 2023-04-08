import { toZod } from "tozod";
import { z } from "zod";

import * as types from "./types";

export const ModelNumbericIdSchema = z.number().int().positive();

export const ApiModelSchema = z.object({
  id: ModelNumbericIdSchema,
});

export const TypedApiModelSchema = ApiModelSchema.extend({
  type: z.enum(types.ApiModelTypes.__ALL__),
});

export const createTypedApiModelSchema = <M extends types.TypedApiModel>(
  type: M["type"],
  obj: (z.ZodObject<{
    [k in keyof types.InferTypedApiModelData<M>]-?: toZod<types.InferTypedApiModelData<M>[k]>;
  }> &
    toZod<types.InferTypedApiModelData<M>>)["shape"],
) =>
  z
    .object({
      type: z.literal(type),
      id: ModelNumbericIdSchema,
    })
    .extend(obj)
    .strict();
