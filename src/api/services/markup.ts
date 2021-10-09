import { client } from "api";
import * as services from "./services";

export const getMarkup = services.retrieveService<Model.Markup>((id: number) => ["markups", id]);
export const deleteMarkup = services.deleteService((id: number) => ["markups", id]);

export const updateMarkup = async <
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
>(
  id: number,
  payload: Partial<Http.MarkupPayload>,
  options: Http.RequestOptions = {}
): Promise<R> => {
  const url = services.URL.v1("markups", id);
  return client.patch<R>(url, payload, options);
};

export const removeMarkupChildren = services.detailPatchService<Http.ModifyMarkupPayload, Model.Markup>(
  (id: number) => ["markups", id, "remove-children"]
);
export const addMarkupChildren = services.detailPatchService<Http.ModifyMarkupPayload, Model.Markup>((id: number) => [
  "markups",
  id,
  "add-children"
]);
