import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getContacts = client.createListModelsService<model.Contact>("/contacts");
export const getContact = client.createParameterizedRetrieveService<"/contacts/:id", model.Contact>(
  "/contacts/:id",
);
export const updateContact = client.createParameterizedPatchService<
  "/contacts/:id/",
  model.Contact,
  types.ContactPayload
>("/contacts/:id/");

export const deleteContact =
  client.createParameterizedDeleteService<"/contacts/:id/">("/contacts/:id/");

export const createContact = client.createParameterizedPostService<
  "/contacts/",
  model.Contact,
  types.ContactPayload
>("/contacts/");

export const getContactAttachments = client.createParameterizedListModelsService<
  "/contacts/:id/attachments",
  model.Attachment
>("/contacts/:id/attachments");

export const deleteContactAttachment =
  client.createParameterizedDeleteService<"/contacts/:contactId/attachments/:id/">(
    "/contacts/:contactId/attachments/:id/",
  );

export const uploadContactAttachment = client.createParameterizedUploadService<
  "/contacts/:id/attachments/",
  { data: model.Attachment[] }
>("/contacts/:id/attachments/");

export const getContactTaggedActuals = client.createParameterizedListModelsService<
  "/contacts/:id/tagged-actuals/",
  model.TaggedActual
>("/contacts/:id/tagged-actuals/");

export const bulkUpdateContacts = client.createPatchService<
  types.ChildListResponse<model.Contact>,
  types.ModelPayload<model.Contact>
>("/contacts/bulk-update/");

export const bulkCreateContacts = client.createPatchService<
  types.ChildListResponse<model.Contact>,
  types.ModelPayload<model.Contact>
>("/contacts/bulk-create/");

export const bulkDeleteContacts = client.createPatchService<null, types.BulkDeletePayload>(
  "/contacts/bulk-create/",
);
