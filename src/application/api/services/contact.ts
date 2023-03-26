import * as services from "./services";

export const getContacts = services.listService<Model.Contact>(["contacts"]);

export const getContact = services.retrieveService<Model.Contact>((id: number) => ["contacts", id]);
export const updateContact = services.detailPatchService<
  Partial<Http.ContactPayload>,
  Model.Contact
>((id: number) => ["contacts", id]);
export const deleteContact = services.deleteService((id: number) => ["contacts", id]);
export const createContact = services.postService<Http.ContactPayload, Model.Contact>(["contacts"]);

export const getContactAttachments = services.detailListService<Model.Attachment>((id: number) => [
  "contacts",
  id,
  "attachments",
]);
export const deleteContactAttachment = services.detailDeleteService((id: number, objId: number) => [
  "contacts",
  objId,
  "attachments",
  id,
]);
export const uploadContactAttachment = services.detailPostService<
  FormData,
  { data: Model.Attachment[] }
>((id: number) => ["contacts", id, "attachments"]);
export const getContactTaggedActuals = services.detailListService<Model.TaggedActual>(
  (id: number) => ["contacts", id, "tagged-actuals"],
);

export const bulkUpdateContacts = services.bulkUpdateService<
  Http.ModelPayload<Model.Contact>,
  Http.ChildListResponse<Model.Contact>
>(["contacts", "bulk-update"]);

export const bulkCreateContacts = services.bulkCreateService<
  Http.ModelPayload<Model.Contact>,
  Http.ChildListResponse<Model.Contact>
>(["contacts", "bulk-create"]);

export const bulkDeleteContacts = services.bulkDeleteService<null>(["contacts", "bulk-delete"]);
