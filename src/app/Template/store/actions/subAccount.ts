import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const setSubAccountIdAction = createAction<ID>(ActionType.SubAccount.SetId);
export const requestSubAccountAction = createAction<null>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = createAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = createAction<Model.SubAccount | undefined>(ActionType.SubAccount.Response);
export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>>(
  ActionType.SubAccount.SubAccounts.TableChanged
);
export const savingTableAction = createAction<boolean>(ActionType.SubAccount.SubAccounts.Saving);
export const requestAction = createAction<null>(ActionType.SubAccount.SubAccounts.Request);
export const loadingAction = createAction<boolean>(ActionType.SubAccount.SubAccounts.Loading);
export const responseAction = createAction<Http.TableResponse<Model.SubAccount, Model.BudgetGroup>>(
  ActionType.SubAccount.SubAccounts.Response
);
export const addModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.SubAccount>>(
  ActionType.SubAccount.SubAccounts.AddToState
);
export const addPlaceholdersToState = createAction<Table.RowAdd<Tables.SubAccountRowData, Model.SubAccount>[]>(
  ActionType.SubAccount.SubAccounts.AddPlaceholdersToState
);
export const setSearchAction = createAction<string>(ActionType.SubAccount.SubAccounts.SetSearch);
export const addSubAccountToStateAction = createAction<Model.SubAccount>(ActionType.SubAccount.SubAccounts.AddToState);

export const addGroupToStateAction = createAction<Model.BudgetGroup>(ActionType.SubAccount.Groups.AddToState);
export const updateGroupInStateAction = createAction<Redux.UpdateActionPayload<Model.BudgetGroup>>(
  ActionType.SubAccount.Groups.UpdateInState
);
