import { client } from "api";
import * as services from "./services";

export const getActual = services.retrieveService<Model.Actual>((id: number) => ["actuals", id]);
export const deleteActual = services.deleteService((id: number) => ["actuals", id]);
export const updateActual = services.detailPatchService<Http.ActualPayload, Model.Actual>((id: number) => [
  "actuals",
  id
]);
export const getActualAttachments = services.detailListService<Model.Attachment>((id: number) => [
  "actuals",
  id,
  "attachments"
]);
export const uploadActualAttachment = services.detailPatchService<FormData, Model.Actual>((id: number) => [
  "actuals",
  id,
  "upload-attachment"
]);
export const getActualTypes = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<Model.Tag>> => {
  const url = services.URL.v1("actuals", "types");
  return client.list<Model.Tag>(url, { no_pagination: true }, options);
};
