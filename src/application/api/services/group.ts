import { budgeting } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getGroup = client.createParameterizedRetrieveService<"/groups/:id", budgeting.Group>(
  "/groups/:id",
);
export const updateGroup = client.createParameterizedPatchService<
  "/groups/:id/",
  budgeting.Group,
  Partial<types.GroupPayload>
>("/groups/:id/");

export const deleteGroup = client.createParameterizedDeleteService<"/groups/:id/">("/groups/:id/");

export const getGroupColors = client.createListService<string>("/groups/colors");
