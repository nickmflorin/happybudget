import { AxiosResponse } from "axios";
import { client } from "api";
import * as services from "./services";

export const register = async (
  payload: Http.RegistrationPayload,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = services.URL.v1("users", "registration");
  return client.post<Model.User>(url, payload, options);
};

export const updateActiveUser = async (
  payload: Partial<Http.UserPayload> | FormData,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = services.URL.v1("users", "user");
  return client.patch<Model.User>(url, payload, options);
};

export const changeUserPassword = async (
  payload: Http.ChangePasswordPayload,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = services.URL.v1("users", "change-password");
  return client.patch<Model.User>(url, payload, options);
};

export const tempUploadImage = async (
  data: FormData,
  options?: Http.RequestOptions
): Promise<AxiosResponse<Http.FileUploadResponse>> => {
  const url = services.URL.v1("users", "temp_upload_user_image");
  return client.upload<Http.FileUploadResponse>(url, data, options);
};
