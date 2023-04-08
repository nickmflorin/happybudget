import { z } from "zod";

import * as schemas from "../schemas";
import * as types from "../types";


export type SimpleAttachment = types.ApiModel<{
  readonly name: string;
  /* The extension will be null if the file name is corrupted and the extension cannot be
     determined. */
  readonly extension: string | null;
  readonly url: string;
}>;

export type Attachment = SimpleAttachment & {
  readonly size: number;
};

export const SimpleAttachmentSchemaObj = z.object({
  id: schemas.ModelNumbericIdSchema,
  name: z.string().nonempty(),
  extension: z.string().nullable(),
  url: z.string().url(),
});

export const SimpleAttachmentSchema: z.ZodType<SimpleAttachment> = SimpleAttachmentSchemaObj;

export const AttachmentSchema: z.ZodType<Attachment> = SimpleAttachmentSchemaObj.extend({
  size: z.union([z.number().int().positive(), z.literal(0)])
});
