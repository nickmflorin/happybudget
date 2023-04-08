import { z } from "zod";

import * as types from "./types";

export const SavedImageSchema: z.ZodType<types.SavedImage> = z
  .object({
    url: z.string().url(),
    size: z.union([z.number().int().positive(), z.literal(0)]),
    height: z.union([z.number().int().positive(), z.literal(0)]),
    width: z.union([z.number().int().positive(), z.literal(0)]),
    extension: z.string().nullable(),
  })
  .strict();
