import { AxiosResponse } from "axios";

import { client } from "api";

import * as services from "./services";

export const register = services.postService<Http.RegistrationPayload, Model.User>([
  "users",
  "registration",
]);

export const searchUsers = async (
  search: string,
  query?: Http.ListQuery,
  options?: Http.RequestOptions,
): Promise<Http.ListResponse<Model.SimpleUser>> => {
  const url = services.URL.v1("users");
  return client.list<Model.SimpleUser>(url, { ...query, search }, options);
};

export const updateActiveUser = services.patchService<
  Partial<Http.UserPayload | FormData>,
  Model.User
>(["users", "user"]);

export const changeUserPassword = services.patchService<Http.ChangePasswordPayload, Model.User>([
  "users",
  "change-password",
]);

export const tempUploadImage = async (
  data: FormData,
  options?: Http.RequestOptions,
): Promise<AxiosResponse<Http.FileUploadResponse>> => {
  const url = services.URL.v1("io", "temp-upload-image");
  return client.upload<Http.FileUploadResponse>(url, data, options);
};
