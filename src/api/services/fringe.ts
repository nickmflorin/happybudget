import { client } from "api";
import * as services from "./services";

export const getFringe = services.retrieveService<Model.Fringe>((id: number) => ["fringes", id]);
export const deleteFringe = services.deleteService((id: number) => ["fringes", id]);
export const updateFringe = services.detailPatchService<Http.FringePayload, Model.Fringe>((id: number) => [
  "fringes",
  id
]);

export const getFringeColors = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<string>> => {
  const url = services.URL.v1("fringes", "colors");
  return client.list<string>(url, { no_pagination: true, ...options });
};
