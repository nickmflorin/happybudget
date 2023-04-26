import { attachment, budgeting } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getActual = client.createParameterizedRetrieveService<
  "/actuals/:id",
  budgeting.Actual
>("/actuals/:id");

export const getActualTypes =
  client.createListModelsService<attachment.Attachment>("/actuals/types/");

export const getActualAttachments = client.createParameterizedListModelsService<
  "/actuals/:id/attachments",
  attachment.Attachment
>("/actuals/:id/attachments");

export const deleteActualAttachment = client.createParameterizedDeleteService<
  "/actuals/:id/attachments/:attachmentId/",
  never
>("/actuals/:id/attachments/:attachmentId/");

export const uploadActualAttachment = client.createParameterizedUploadService<
  "/actuals/:id/attachments/",
  { data: attachment.Attachment[] }
>("/actuals/:id/attachments/");

export const deleteActual = client.createParameterizedDeleteService<"/actuals/:id/", never>(
  "/actuals/:id/",
);

export const updateActual = client.createParameterizedPatchService<
  "/actuals/:id/",
  budgeting.Actual,
  Partial<types.ActualPayload>
>("/actuals/:id/");
