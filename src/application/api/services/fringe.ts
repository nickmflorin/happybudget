import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getFringe = client.createParameterizedRetrieveService<"/fringes/:id", model.Fringe>(
  "/fringes/:id",
);
export const updateFringe = client.createParameterizedPatchService<
  "/fringes/:id/",
  model.Fringe,
  types.FringePayload
>("/fringes/:id/");

export const deleteFringe =
  client.createParameterizedDeleteService<"/fringes/:id/">("/fringes/:id/");

export const getFringeColors = client.createListService<string>("/fringes/colors");
