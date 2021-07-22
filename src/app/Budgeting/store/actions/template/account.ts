import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const setAccountIdAction = simpleAction<number>(ActionType.Template.Account.SetId);
export const requestAccountAction = simpleAction<null>(ActionType.Template.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Template.Account.Loading);
export const responseAccountAction = simpleAction<Model.Account | undefined>(ActionType.Template.Account.Response);
export const updateAccountInStateAction = simpleAction<Partial<Redux.UpdateModelActionPayload<Model.Account>>>(
  ActionType.Template.Account.UpdateInState
);
export const handleTableChangeEventAction = simpleAction<
  Table.ChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount>
>(ActionType.Template.Account.TableChanged);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.SubAccounts.Deleting
);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.SubAccounts.Updating
);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.Template.Account.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.Template.Account.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.Template.Account.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.ListResponse<Model.SubAccount>>(
  ActionType.Template.Account.SubAccounts.Response
);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.Template.Account.SubAccounts.SetSearch);
export const addSubAccountToStateAction = simpleAction<Model.SubAccount>(
  ActionType.Template.Account.SubAccounts.AddToState
);
export const requestGroupsAction = simpleAction<null>(ActionType.Template.Account.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.Template.Account.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.ListResponse<Model.Group>>(
  ActionType.Template.Account.Groups.Response
);
export const addGroupToStateAction = simpleAction<Model.Group>(ActionType.Template.Account.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Group>>(
  ActionType.Template.Account.Groups.UpdateInState
);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.Groups.Deleting
);
export const deleteGroupAction = simpleAction<number>(ActionType.Template.Account.Groups.Delete);
export const requestFringesAction = simpleAction<null>(ActionType.Template.Account.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Template.Account.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.ListResponse<Model.Fringe>>(
  ActionType.Template.Account.Fringes.Response
);
export const handleFringesTableChangeEventAction = simpleAction<Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe>>(
  ActionType.Template.Account.Fringes.TableChanged
);
export const deletingFringeAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.Fringes.Deleting
);
export const updatingFringeAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Template.Account.Fringes.Updating
);
export const creatingFringeAction = simpleAction<boolean>(ActionType.Template.Account.Fringes.Creating);
export const setFringesSearchAction = simpleAction<string>(ActionType.Template.Account.Fringes.SetSearch);
export const addFringeToStateAction = simpleAction<Model.Fringe>(ActionType.Template.Account.Fringes.AddToState);
