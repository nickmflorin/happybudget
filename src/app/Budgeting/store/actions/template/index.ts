import { redux } from "lib";
import ActionType from "../ActionType";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export const wipeStateAction = redux.actions.simpleAction<null>(ActionType.Template.WipeState);
export const setTemplateIdAction = redux.actions.simpleAction<number>(ActionType.Template.SetId);
export const setTemplateAutoIndex = redux.actions.simpleAction<boolean>(ActionType.Template.SetAutoIndex);
export const requestTemplateAction = redux.actions.simpleAction<null>(ActionType.Template.Request);
export const loadingTemplateAction = redux.actions.simpleAction<boolean>(ActionType.Template.Loading);
export const responseTemplateAction = redux.actions.simpleAction<Model.Template | undefined>(
  ActionType.Template.Response
);
export const updateTemplateInStateAction = redux.actions.simpleAction<Partial<Model.Template>>(
  ActionType.Template.UpdateInState
);
