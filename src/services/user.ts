import { client } from "api";
import { URL } from "./util";

export const register = async (payload: Http.IRegistrationPayload, options?: Http.IRequestOptions): Promise<IUser> => {
  options = { ...options, redirectOnAuthenticationError: false };
  const url = URL.v1("users", "registration");
  return client.post<IUser>(url, payload, options);
};

export const updateActiveUser = async (
  payload: Partial<Http.IUserPayload>,
  options?: Http.IRequestOptions
): Promise<IUser> => {
  const url = URL.v1("users", "user");
  return client.patch<IUser>(url, payload, options);
};
