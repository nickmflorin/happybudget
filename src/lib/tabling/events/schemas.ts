import { z } from "zod";

import * as rows from "../rows";

import * as types from "./types";

export const RowAddDataPayloadSchema: z.ZodType<types.RowAddDataPayload> = z
  .object({
    data: z.array(z.object({}).nonstrict().passthrough()).nonempty(),
    placeholderIds: z.array(rows.PlaceholderRowIdSchema).nonempty(),
  })
  .strict();

export const RowAddIndexPayloadSchema: z.ZodType<types.RowAddIndexPayload> = z
  .object({
    newIndex: z.union([z.number().int().positive(), z.literal(0)]),
    count: z.number().int().positive().optional(),
    placeholderIds: z.array(rows.PlaceholderRowIdSchema).nonempty(),
  })
  .strict();

export const RowAddCountPayloadSchema: z.ZodType<types.RowAddCountPayload> = z
  .object({
    count: z.number().int().positive(),
    placeholderIds: z.array(rows.PlaceholderRowIdSchema).nonempty(),
  })
  .strict();
