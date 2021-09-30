import { client } from "api";
import * as services from "./services";

export const getFringe = services.retrieveService<Model.Fringe>((id: number) => ["fringes", id]);

export const deleteFringe = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = services.URL.v1("fringes", id);
  return client.delete<null>(url, options);
};

export const updateFringe = async (
  id: number,
  payload: Partial<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = services.URL.v1("fringes", id);
  return client.patch<Model.Fringe>(url, payload, options);
};

export const getFringeColors = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<string>> => {
  const url = services.URL.v1("fringes", "colors");
  return client.list<string>(url, { no_pagination: true, ...options });
};
