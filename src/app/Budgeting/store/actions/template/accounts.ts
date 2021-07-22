import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const handleTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.AccountRow, Model.Account>>(
  ActionType.Template.Accounts.TableChanged
);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Template.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.Template.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Template.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.ListResponse<Model.Account>>(
  ActionType.Template.Accounts.Response
);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Template.Accounts.SetSearch);
export const addAccountToStateAction = simpleAction<Model.Account>(ActionType.Template.Accounts.AddToState);
export const requestGroupsAction = simpleAction<null>(ActionType.Template.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Template.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.Group>>(ActionType.Template.Groups.Response);
export const addGroupToStateAction = simpleAction<Model.Group>(ActionType.Template.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Template.Groups.UpdateInState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Template.Groups.Deleting);
export const deleteGroupAction = simpleAction<number>(ActionType.Template.Groups.Delete);
