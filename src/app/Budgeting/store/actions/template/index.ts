import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setTemplateIdAction = simpleAction<number>(ActionType.Template.SetId);
export const setInstanceAction = simpleAction<Model.TemplateAccount | Model.TemplateSubAccount | null>(
  ActionType.Template.SetInstance
);
export const requestTemplateAction = simpleAction<null>(ActionType.Template.Request);
export const loadingTemplateAction = simpleAction<boolean>(ActionType.Template.Loading);
export const responseTemplateAction = simpleAction<Model.Template | undefined>(ActionType.Template.Response);
