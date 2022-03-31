import * as services from "./services";

export const deleteCollaborator = services.deleteService((id: number) => ["collaborators", id]);
export const updateCollaborator = services.detailPatchService<
  Partial<Omit<Http.CollaboratorPayload, "user">>,
  Model.Collaborator
>((id: number) => ["collaborators", id]);
