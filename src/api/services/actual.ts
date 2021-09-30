import { client } from "api";
import * as services from "./services";

export const getActual = services.retrieveService<Model.Actual>((id: number) => ["actuals", id]);

export const deleteActual = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = services.URL.v1("actuals", id);
  return client.delete<null>(url, options);
};

export const updateActual = async (
  id: number,
  payload: Partial<Http.ActualPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Actual> => {
  const url = services.URL.v1("actuals", id);
  return client.patch<Model.Actual>(url, payload, options);
};
