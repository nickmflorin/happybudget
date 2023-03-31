import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getMarkup = client.createParameterizedRetrieveService<"/markups/:id", model.Markup>(
  "/markups/:id",
);

export const deleteMarkup =
  client.createParameterizedDeleteService<"/markups/:id/">("/markups/:id/");

export const updateMarkup = client.createParameterizedPatchService<
  "/markups/:id/",
  types.MarkupResponseType,
  Partial<types.MarkupPayload>
>("/markups/:id/");
