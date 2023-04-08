import { z } from "zod";

import * as fs from "../../fs";
import * as schemas from "../schemas";

import * as types from "./types";

export const SimpleUserSchemaObj = z
  .object({
    id: schemas.ModelNumbericIdSchema,
    first_name: z.string().nonempty(),
    last_name: z.string().nonempty(),
    full_name: z.string().nonempty(),
    email: z.string().email().nonempty(),
    profile_image: z.nullable(fs.SavedImageSchema),
  })
  .strict();

export const SimpleUserSchema: z.ZodType<types.SimpleUser> = SimpleUserSchemaObj;
