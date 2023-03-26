import * as services from "./services";

export const getFringe = services.retrieveService<Model.Fringe>((id: number) => ["fringes", id]);
export const deleteFringe = services.deleteService((id: number) => ["fringes", id]);
export const updateFringe = services.detailPatchService<Partial<Http.FringePayload>, Model.Fringe>(
  (id: number) => ["fringes", id],
);
export const getFringeColors = services.listService<string>(["fringes", "colors"]);
