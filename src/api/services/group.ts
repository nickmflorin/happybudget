import { client } from "api";
import { URL } from "./util";

export const updateGroup = async (
  id: number,
  payload: Partial<Http.GroupPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Group> => {
  const url = URL.v1("groups", id);
  return client.patch<Model.Group>(url, payload, options);
};

export const deleteGroup = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("groups", id);
  return client.delete<null>(url, options);
};

export const getGroup = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Group> => {
  const url = URL.v1("groups", id);
  return client.retrieve<Model.Group>(url, options);
};

export const getGroupColors = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<string>> => {
  const url = URL.v1("groups", "colors");
  return client.list<string>(url, { no_pagination: true, ...options });
};
