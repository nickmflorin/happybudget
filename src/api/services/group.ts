import { client } from "api";
import { URL } from "./util";

export const updateGroup = async <G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup>(
  id: number,
  payload: Partial<Http.GroupPayload>,
  options: Http.RequestOptions = {}
): Promise<G> => {
  const url = URL.v1("groups", id);
  return client.patch<G>(url, payload, options);
};

export const deleteGroup = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("groups", id);
  return client.delete<null>(url, options);
};

export const getGroup = async <G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup>(
  id: number,
  options: Http.RequestOptions = {}
): Promise<G> => {
  const url = URL.v1("groups", id);
  return client.retrieve<G>(url, options);
};
