import { AxiosResponse } from "axios";
import { client } from "api";
import * as services from "./services";

export const register = services.postService<Http.RegistrationPayload, Model.User>(["users", "registration"]);

export const updateActiveUser = services.patchService<Partial<Http.UserPayload | FormData>, Model.User>([
  "users",
  "user"
]);

export const changeUserPassword = services.patchService<Http.ChangePasswordPayload, Model.User>([
  "users",
  "change-password"
]);

export const tempUploadImage = async (
  data: FormData,
  options?: Http.RequestOptions
): Promise<AxiosResponse<Http.FileUploadResponse>> => {
  const url = services.URL.v1("io", "temp-upload-image");
  return client.upload<Http.FileUploadResponse>(url, data, options);
};
