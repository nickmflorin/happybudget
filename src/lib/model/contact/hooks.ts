import * as api from "api";
import { useModel, ModelHookOptions } from "../hooks";

export const useContact = (
  id: number,
  options?: Omit<ModelHookOptions<Model.Contact>, "request">
): [Model.Contact | null, boolean, Error | null] => {
  return useModel(id, { ...options, request: api.getContact });
};
