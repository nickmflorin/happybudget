import { attachment, contact, budgeting } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getContacts = client.createListModelsService<contact.Contact>("/contacts");
export const getContact = client.createParameterizedRetrieveService<
  "/contacts/:id",
  contact.Contact
>("/contacts/:id");
export const updateContact = client.createParameterizedPatchService<
  "/contacts/:id/",
  contact.Contact,
  types.ContactPayload
>("/contacts/:id/");

export const deleteContact =
  client.createParameterizedDeleteService<"/contacts/:id/">("/contacts/:id/");

export const createContact = client.createParameterizedPostService<
  "/contacts/",
  contact.Contact,
  types.ContactPayload
>("/contacts/");

export const getContactAttachments = client.createParameterizedListModelsService<
  "/contacts/:id/attachments",
  attachment.Attachment
>("/contacts/:id/attachments");

export const deleteContactAttachment =
  client.createParameterizedDeleteService<"/contacts/:contactId/attachments/:id/">(
    "/contacts/:contactId/attachments/:id/",
  );

export const uploadContactAttachment = client.createParameterizedUploadService<
  "/contacts/:id/attachments/",
  { data: attachment.Attachment[] }
>("/contacts/:id/attachments/");

export const getContactTaggedActuals = client.createParameterizedListModelsService<
  "/contacts/:id/tagged-actuals/",
  budgeting.TaggedActual
>("/contacts/:id/tagged-actuals/");

export const bulkUpdateContacts = client.createPatchService<
  types.ChildListResponse<contact.Contact>,
  types.BulkUpdatePayload<types.ModelPayload<contact.Contact>>
>("/contacts/bulk-update/");

export const bulkCreateContacts = client.createPatchService<
  types.ChildListResponse<contact.Contact>,
  types.BulkCreatePayload<types.ModelPayload<contact.Contact>>
>("/contacts/bulk-create/");

export const bulkDeleteContacts = client.createPatchService<null, types.BulkDeletePayload>(
  "/contacts/bulk-create/",
);
