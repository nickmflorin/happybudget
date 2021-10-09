import { client } from "api";
import * as services from "./services";

export const getGroup = services.retrieveService<Model.Group>((id: number) => ["groups", id]);
export const deleteGroup = services.deleteService((id: number) => ["groups", id]);
export const updateGroup = services.detailPatchService<Http.GroupPayload, Model.Group>((id: number) => ["groups", id]);

export const getGroupColors = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<string>> => {
  const url = services.URL.v1("groups", "colors");
  return client.list<string>(url, { no_pagination: true, ...options });
};
