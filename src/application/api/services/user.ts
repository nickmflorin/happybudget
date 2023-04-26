import { user } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const register = client.createPostService<user.User, types.RegistrationPayload>(
  "/users/register/",
);

export const searchUsers = (
  search: string,
  query?: Omit<types.ApiModelListQuery<user.SimpleUser>, "search">,
  options?: types.ExposedClientRequestOptions<{ query: types.ApiModelListQuery<user.SimpleUser> }>,
): Promise<types.ClientResponse<types.ApiListResponse<user.SimpleUser>>> =>
  client.list<user.SimpleUser, types.ApiModelListQuery<user.SimpleUser>>("/users", {
    ...options,
    query: { ...query, search },
  });

export const updateActiveUser = client.createPatchService<user.User, types.UserPayload>(
  "/users/user/",
);

export const changeUserPassword = client.createPatchService<user.User, types.ChangePasswordPayload>(
  "/users/change-password/",
);

export const tempUploadImage =
  client.createUploadService<types.FileUploadResponse>("/io/temp-upload-image/");
