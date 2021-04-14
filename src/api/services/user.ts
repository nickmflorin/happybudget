import { client } from "api";
import { URL } from "./util";

export const register = async (
  payload: Http.RegistrationPayload,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = URL.v1("users", "registration");
  return client.post<Model.User>(url, payload, options);
};

export const updateActiveUser = async (
  payload: Partial<Http.UserPayload>,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = URL.v1("users", "user");
  return client.patch<Model.User>(url, payload, options);
};
