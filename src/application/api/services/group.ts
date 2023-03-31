import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getGroup = client.createParameterizedRetrieveService<"/groups/:id", model.Group>(
  "/groups/:id",
);
export const updateGroup = client.createParameterizedPatchService<
  "/groups/:id/",
  model.Group,
  Partial<types.GroupPayload>
>("/groups/:id/");

export const deleteGroup = client.createParameterizedDeleteService<"/groups/:id/">("/groups/:id/");

export const getGroupColors = client.createListService<string>("/groups/colors");
