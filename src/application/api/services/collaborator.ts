import { budgeting } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const deleteCollaborator =
  client.createParameterizedDeleteService<"/collaborators/:id/">("/collaborators/:id/");

export const updateCollaborator = client.createParameterizedPatchService<
  "/collaborators/:id/",
  budgeting.Collaborator,
  types.CollaboratorPayload
>("/collaborators/:id/");
