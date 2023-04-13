import { z } from "zod";

import * as fs from "../../fs";
import * as attachment from "../attachment";
import * as schemas from "../schemas";
import { ApiModelTypes } from "../types";

import * as types from "./types";

export const EmployeeContactTypeSchema: z.ZodType<types.EmployeeContactType> = z.object({
  id: z.literal(1),
  name: z.literal("Employee"),
  slug: z.literal("employee"),
});

export const VendorContactTypeSchema: z.ZodType<types.VendorContactType> = z.object({
  id: z.literal(2),
  name: z.literal("Vendor"),
  slug: z.literal("vendor"),
});

export const ContractorContactTypeSchema: z.ZodType<types.ContractorContactType> = z.object({
  id: z.literal(0),
  name: z.literal("Contractor"),
  slug: z.literal("contractor"),
});

export const ContactTypeSchema: z.ZodType<types.ContactType> = z.union([
  EmployeeContactTypeSchema,
  VendorContactTypeSchema,
  ContractorContactTypeSchema,
]);

export const ContactSchema: z.ZodType<types.Contact> = z.object({
  id: schemas.ModelNumbericIdSchema,
  type: z.literal(ApiModelTypes.CONTACT),
  contact_type: ContactTypeSchema.nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string(),
  company: z.string().nullable(),
  position: z.string().nullable(),
  rate: z.number().nullable(),
  city: z.string().nullable(),
  notes: z.string().nullable(),
  // Should this be coerced as an email?
  email: z.string().nullable(),
  // Should this be coerced as a phone number?
  phone_number: z.string().nullable(),
  attachments: z.array(attachment.SimpleAttachmentSchema),
  image: fs.SavedImageSchema.nullable(),
});
