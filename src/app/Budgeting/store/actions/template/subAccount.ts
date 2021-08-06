import { redux } from "lib";
import ActionType from "../ActionType";

export const setSubAccountIdAction = redux.actions.simpleAction<number>(ActionType.Template.SubAccount.SetId);
export const requestSubAccountAction = redux.actions.simpleAction<null>(ActionType.Template.SubAccount.Request);
export const loadingSubAccountAction = redux.actions.simpleAction<boolean>(ActionType.Template.SubAccount.Loading);
export const responseSubAccountAction = redux.actions.simpleAction<Model.SubAccount | undefined>(
  ActionType.Template.SubAccount.Response
);
export const handleTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.SubAccountRow, Model.SubAccount>
>(ActionType.Template.SubAccount.TableChanged);
export const deletingSubAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.SubAccounts.Deleting
);
export const updatingSubAccountAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.SubAccounts.Updating
);
export const creatingSubAccountAction = redux.actions.simpleAction<boolean>(
  ActionType.Template.SubAccount.SubAccounts.Creating
);
export const requestSubAccountsAction = redux.actions.simpleAction<null>(
  ActionType.Template.SubAccount.SubAccounts.Request
);
export const loadingSubAccountsAction = redux.actions.simpleAction<boolean>(
  ActionType.Template.SubAccount.SubAccounts.Loading
);
export const responseSubAccountsAction = redux.actions.simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Template.SubAccount.SubAccounts.Response
);
export const setSubAccountsSearchAction = redux.actions.simpleAction<string>(
  ActionType.Template.SubAccount.SubAccounts.SetSearch
);
export const addSubAccountToStateAction = redux.actions.simpleAction<Model.SubAccount>(
  ActionType.Template.SubAccount.SubAccounts.AddToState
);
export const requestGroupsAction = redux.actions.simpleAction<null>(ActionType.Template.SubAccount.Groups.Request);
export const loadingGroupsAction = redux.actions.simpleAction<boolean>(ActionType.Template.SubAccount.Groups.Loading);
export const responseGroupsAction = redux.actions.simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Template.SubAccount.Groups.Response
);
export const addGroupToStateAction = redux.actions.simpleAction<Model.Group>(
  ActionType.Template.SubAccount.Groups.AddToState
);
export const updateGroupInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Template.SubAccount.Groups.UpdateInState
);
export const deletingGroupAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.Groups.Deleting
);
export const deleteGroupAction = redux.actions.simpleAction<number>(ActionType.Template.SubAccount.Groups.Delete);
export const requestFringesAction = redux.actions.simpleAction<null>(ActionType.Template.SubAccount.Fringes.Request);
export const loadingFringesAction = redux.actions.simpleAction<boolean>(ActionType.Template.SubAccount.Fringes.Loading);
export const responseFringesAction = redux.actions.simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Template.SubAccount.Fringes.Response
);
export const handleFringesTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.FringeRow, Model.Fringe>
>(ActionType.Template.SubAccount.Fringes.TableChanged);
export const deletingFringeAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.Fringes.Deleting
);
export const updatingFringeAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.SubAccount.Fringes.Updating
);
export const creatingFringeAction = redux.actions.simpleAction<boolean>(
  ActionType.Template.SubAccount.Fringes.Creating
);
export const setFringesSearchAction = redux.actions.simpleAction<string>(
  ActionType.Template.SubAccount.Fringes.SetSearch
);
export const addFringeToStateAction = redux.actions.simpleAction<Model.Fringe>(
  ActionType.Template.SubAccount.Fringes.AddToState
);
