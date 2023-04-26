import { budgeting } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getMarkup = client.createParameterizedRetrieveService<
  "/markups/:id",
  budgeting.Markup
>("/markups/:id");

export const deleteMarkup =
  client.createParameterizedDeleteService<"/markups/:id/">("/markups/:id/");

export const updateMarkup = client.createParameterizedPatchService<
  "/markups/:id/",
  types.MarkupResponseType,
  Partial<types.MarkupPayload>
>("/markups/:id/");
