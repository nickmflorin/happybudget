import { client } from "api";
import { URL } from "./util";

export const getFringe = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Fringe> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.retrieve<Model.Fringe>(url, options);
};

export const deleteFringe = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.delete<null>(url, options);
};

export const updateFringe = async (
  id: number,
  payload: Partial<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.patch<Model.Fringe>(url, payload, options);
};
