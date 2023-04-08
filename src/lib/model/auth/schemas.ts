import { z } from "zod";

import * as schemas from "../schemas";

import * as types from "./types";

export const PublicTokenSchema: z.ZodType<types.PublicToken> = z
  .object({
    id: schemas.ModelNumbericIdSchema,
    public_id: z.string().nonempty(),
    is_expired: z.boolean(),
    expires_at: z.string().nonempty().nullable(),
    created_at: z.string().nonempty(),
  })
  .strict();
