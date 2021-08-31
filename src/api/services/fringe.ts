import { client } from "api";
import { URL } from "./util";

export const getFringe = async (id: ID, options: Http.RequestOptions = {}): Promise<Model.Fringe> => {
  const url = URL.v1("fringes", id);
  return client.retrieve<Model.Fringe>(url, options);
};

export const deleteFringe = async (id: ID, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("fringes", id);
  return client.delete<null>(url, options);
};

export const updateFringe = async (
  id: ID,
  payload: Partial<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = URL.v1("fringes", id);
  return client.patch<Model.Fringe>(url, payload, options);
};

export const getFringeColors = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<string>> => {
  const url = URL.v1("fringes", "colors");
  return client.list<string>(url, { no_pagination: true, ...options });
};
