import * as services from "./services";

export const getActual = services.retrieveService<Model.Actual>((id: number) => ["actuals", id]);
export const deleteActual = services.deleteService((id: number) => ["actuals", id]);
export const updateActual = services.detailPatchService<Http.ActualPayload, Model.Actual>((id: number) => [
  "actuals",
  id
]);
