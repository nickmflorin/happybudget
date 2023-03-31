import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getActual = client.createParameterizedRetrieveService<"/actuals/:id", model.Account>(
  "/actuals/:id",
);

export const getActualTypes = client.createListModelsService<model.Attachment>("/actuals/types/");

export const getActualAttachments = client.createParameterizedListModelsService<
  "/actuals/:id/attachments",
  model.Attachment
>("/actuals/:id/attachments");

export const deleteActualAttachment = client.createParameterizedDeleteService<
  "/actuals/:id/attachments/:attachmentId/",
  never
>("/actuals/:id/attachments/:attachmentId/");

export const uploadActualAttachment = client.createParameterizedUploadService<
  "/actuals/:id/attachments/",
  { data: model.Attachment[] }
>("/actuals/:id/attachments/");

export const deleteActual = client.createParameterizedDeleteService<"/actuals/:id/", never>(
  "/actuals/:id/",
);

export const updateActual = client.createParameterizedPatchService<
  "/actuals/:id/",
  model.Actual,
  Partial<types.ActualPayload>
>("/actuals/:id/");
