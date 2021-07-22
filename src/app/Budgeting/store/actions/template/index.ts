import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const wipeStateAction = simpleAction<null>(ActionType.Template.WipeState);
export const setTemplateIdAction = simpleAction<number>(ActionType.Template.SetId);
export const setTemplateAutoIndex = simpleAction<boolean>(ActionType.Template.SetAutoIndex);
export const requestTemplateAction = simpleAction<null>(ActionType.Template.Request);
export const loadingTemplateAction = simpleAction<boolean>(ActionType.Template.Loading);
export const responseTemplateAction = simpleAction<Model.Template | undefined>(ActionType.Template.Response);
export const updateTemplateInStateAction = simpleAction<Partial<Model.Template>>(ActionType.Template.UpdateInState);
