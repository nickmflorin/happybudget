import { client } from "api";
import { URL } from "./util";

export const getActual = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Actual> => {
  const url = URL.v1("actuals", id);
  return client.retrieve<Model.Actual>(url, options);
};

export const deleteActual = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("actuals", id);
  return client.delete<null>(url, options);
};

export const updateActual = async (
  id: number,
  payload: Partial<Http.ActualPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Actual> => {
  const url = URL.v1("actuals", id);
  return client.patch<Model.Actual>(url, payload, options);
};
