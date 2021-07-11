import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setSubAccountIdAction = simpleAction<number>(ActionType.Template.SubAccount.SetId);
export const requestSubAccountAction = simpleAction<null>(ActionType.Template.SubAccount.Request);
export const loadingSubAccountAction = simpleAction<boolean>(ActionType.Template.SubAccount.Loading);
export const responseSubAccountAction = simpleAction<Model.SubAccount | undefined>(
  ActionType.Template.SubAccount.Response
);
export const handleTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.SubAccountRow>>(
  ActionType.Template.SubAccount.TableChanged
);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Template.SubAccount.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Template.SubAccount.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Template.SubAccount.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Template.SubAccount.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Template.SubAccount.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(
  ActionType.Template.SubAccount.SubAccounts.RemoveFromGroup
);
export const addSubAccountToGroupAction = simpleAction<{ id: number; group: number }>(
  ActionType.Template.SubAccount.SubAccounts.AddToGroup
);
export const addSubAccountToStateAction = simpleAction<Model.SubAccount>(
  ActionType.Template.SubAccount.SubAccounts.AddToState
);
export const requestGroupsAction = simpleAction<null>(ActionType.Template.SubAccount.SubAccounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Template.SubAccount.SubAccounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Template.SubAccount.SubAccounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.Group>(
  ActionType.Template.SubAccount.SubAccounts.Groups.AddToState
);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Template.SubAccount.SubAccounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(
  ActionType.Template.SubAccount.SubAccounts.Groups.RemoveFromState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.SubAccounts.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Template.SubAccount.SubAccounts.Groups.Delete);
export const requestFringesAction = simpleAction<null>(ActionType.Template.SubAccount.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Template.SubAccount.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Template.SubAccount.Fringes.Response
);
export const handleFringesTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.FringeRow>>(
  ActionType.Template.SubAccount.Fringes.TableChanged
);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.Fringes.Deleting
);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.Fringes.Updating
);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Template.SubAccount.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Template.SubAccount.Fringes.SetSearch);
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Template.SubAccount.Fringes.AddToState);
