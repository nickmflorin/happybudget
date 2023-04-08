import { z } from "zod";

import * as response from "./response";

export const createApiListResponseSchema = <M extends response.ListResponseIteree>(
  obj: z.ZodType<M>,
): z.ZodType<response.ApiListResponse<M>> =>
  z
    .object({
      count: z.number().int().positive().min(0),
      data: z.array<z.ZodType<M>>(obj),
    })
    .strict();
