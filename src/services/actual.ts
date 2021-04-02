import { client } from "api";
import { URL } from "./util";

export const getActual = async (id: number, options: Http.IRequestOptions = {}): Promise<IActual> => {
  const url = URL.v1("actuals", id);
  return client.retrieve<IActual>(url, options);
};

export const deleteActual = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("actuals", id);
  return client.delete<null>(url, options);
};

export const updateActual = async (
  id: number,
  payload: Partial<Http.IActualPayload>,
  options: Http.IRequestOptions = {}
): Promise<IActual> => {
  const url = URL.v1("actuals", id);
  return client.patch<IActual>(url, payload, options);
};
