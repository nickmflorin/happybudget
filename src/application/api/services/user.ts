import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const register = client.createPostService<model.User, types.RegistrationPayload>(
  "/users/register/",
);

export const searchUsers = (
  search: string,
  query?: Omit<types.ApiModelListQuery<model.SimpleUser>, "search">,
  options?: types.ExposedClientRequestOptions<{ query: types.ApiModelListQuery<model.SimpleUser> }>,
): Promise<types.ClientResponse<types.ApiListResponse<model.SimpleUser>>> =>
  client.list<model.SimpleUser, types.ApiModelListQuery<model.SimpleUser>>("/users", {
    ...options,
    query: { ...query, search },
  });

export const updateActiveUser = client.createPatchService<model.User, types.UserPayload>(
  "/users/user/",
);

export const changeUserPassword = client.createPatchService<
  model.User,
  types.ChangePasswordPayload
>("/users/change-password/");

export const tempUploadImage =
  client.createUploadService<types.FileUploadResponse>("/io/temp-upload-image/");
