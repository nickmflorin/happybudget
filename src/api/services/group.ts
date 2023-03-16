import * as services from "./services";

export const getGroup = services.retrieveService<Model.Group>((id: number) => ["groups", id]);
export const deleteGroup = services.deleteService((id: number) => ["groups", id]);
export const updateGroup = services.detailPatchService<Partial<Http.GroupPayload>, Model.Group>(
  (id: number) => ["groups", id],
);
export const getGroupColors = services.listService<string>(["groups", "colors"]);
