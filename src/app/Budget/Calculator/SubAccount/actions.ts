import { simpleAction } from "store/actions";

export const ActionType = {
  SubAccount: {
    SetId: "calculator.subaccount.SetId",
    Loading: "calculator.subaccount.Loading",
    Response: "calculator.subaccount.Response",
    Request: "calculator.subaccount.Request",
    UpdateInState: "calculator.subaccount.UpdateInState",
    BulkUpdate: "calculator.subaccount.BulkUpdate"
  },
  Comments: {
    Loading: "calculator.subaccount.comments.Loading",
    Response: "calculator.subaccount.comments.Response",
    Request: "calculator.subaccount.comments.Request",
    Delete: "calculator.subaccount.comments.Delete",
    Edit: "calculator.subaccount.comments.Edit",
    Submitting: "calculator.subaccount.comments.Submitting",
    Deleting: "calculator.subaccount.comments.Deleting",
    Replying: "calculator.subaccount.comments.Replying",
    Editing: "calculator.subaccount.comments.Editing",
    Submit: "calculator.subaccount.comments.Submit",
    AddToState: "calculator.subaccount.comments.AddToState",
    RemoveFromState: "calculator.subaccount.comments.RemoveFromState",
    UpdateInState: "calculator.subaccount.comments.UpdateInState"
  },
  SubAccounts: {
    Deleting: "calculator.subaccount.subaccounts.Deleting",
    Creating: "calculator.subaccount.subaccounts.Creating",
    Updating: "calculator.subaccount.subaccounts.Updating",
    Update: "calculator.subaccount.subaccounts.Update",
    Remove: "calculator.subaccount.subaccounts.Remove",
    SetSearch: "calculator.subaccount.subaccounts.SetSearch",
    Loading: "calculator.subaccount.subaccounts.Loading",
    Select: "calculator.subaccount.subaccounts.Select",
    Deselect: "calculator.subaccount.subaccounts.Deselect",
    SelectAll: "calculator.subaccount.subaccounts.SelectAll",
    Response: "calculator.subaccount.subaccounts.Response",
    Request: "calculator.subaccount.subaccounts.Request",
    UpdateInState: "calculator.subaccount.subaccounts.UpdateInState",
    RemoveFromState: "calculator.subaccount.subaccounts.RemoveFromState",
    AddToState: "calculator.subaccount.subaccounts.AddToState",
    RemoveFromGroup: "calculator.subaccount.subaccounts.RemoveFromGroup",
    // Errors Functionality Needs to be Built Back In
    AddErrors: "calculator.subaccount.subaccounts.AddErrors",
    Placeholders: {
      AddToState: "calculator.subaccount.subaccounts.placeholders.AddToState",
      Activate: "calculator.subaccount.subaccounts.placeholders.Activate",
      UpdateInState: "calculator.subaccount.subaccounts.placeholders.UpdateInState",
      RemoveFromState: "calculator.subaccount.subaccounts.placeholders.RemoveFromState"
    },
    Groups: {
      Response: "calculator.subaccount.subaccounts.groups.Response",
      Request: "calculator.subaccount.subaccounts.groups.Request",
      Loading: "calculator.subaccount.subaccounts.groups.Loading",
      Delete: "calculator.subaccount.subaccounts.groups.Delete",
      Deleting: "calculator.subaccount.subaccounts.groups.Deleting",
      AddToState: "calculator.subaccount.subaccounts.groups.AddToState",
      RemoveFromState: "calculator.subaccount.subaccounts.groups.RemoveFromState",
      UpdateInState: "calculator.subaccount.subaccounts.groups.UpdateInState"
    },
    History: {
      Loading: "calculator.subaccount.subaccounts.history.Loading",
      Response: "calculator.subaccount.subaccounts.history.Response",
      Request: "calculator.subaccount.subaccounts.history.Request"
    }
  }
};
export const setSubAccountIdAction = simpleAction<number>(ActionType.SubAccount.SetId);
export const requestSubAccountAction = simpleAction<null>(ActionType.SubAccount.Request);
export const loadingSubAccountAction = simpleAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = simpleAction<ISubAccount>(ActionType.SubAccount.Response);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const updateParentSubAccountInStateAction = simpleAction<Partial<IAccount>>(ActionType.SubAccount.UpdateInState);
export const bulkUpdateSubAccountAction = simpleAction<Table.RowChange[]>(ActionType.SubAccount.BulkUpdate);

/*
  Actions Pertaining to Sub Account Comments
*/
export const requestCommentsAction = simpleAction<null>(ActionType.Comments.Request);
export const responseCommentsAction = simpleAction<Http.IListResponse<IComment>>(ActionType.Comments.Response);
export const loadingCommentsAction = simpleAction<boolean>(ActionType.Comments.Loading);
export const submitCommentAction = simpleAction<{ parent?: number; data: Http.ICommentPayload }>(
  ActionType.Comments.Submit
);
export const submittingCommentAction = simpleAction<boolean>(ActionType.Comments.Submitting);
export const deleteCommentAction = simpleAction<number>(ActionType.Comments.Delete);
export const editCommentAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(ActionType.Comments.Edit);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Replying);
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Deleting);
export const editingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Editing);
export const addCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Comments.UpdateInState
);
/*
  Actions Pertaining to Account Sub Accounts
*/
export const updateSubAccountAction = simpleAction<Table.RowChange>(ActionType.SubAccounts.Update);
export const removeSubAccountAction = simpleAction<number>(ActionType.SubAccounts.Remove);
export const deletingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.SubAccounts.Deleting);
export const updatingSubAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.SubAccounts.Updating);
export const creatingSubAccountAction = simpleAction<boolean>(ActionType.SubAccounts.Creating);
export const requestSubAccountsAction = simpleAction<null>(ActionType.SubAccounts.Request);
export const loadingSubAccountsAction = simpleAction<boolean>(ActionType.SubAccounts.Loading);
export const responseSubAccountsAction = simpleAction<Http.IListResponse<ISubAccount>>(ActionType.SubAccounts.Response);
export const setSubAccountsSearchAction = simpleAction<string>(ActionType.SubAccounts.SetSearch);
export const removeSubAccountFromGroupAction = simpleAction<number>(ActionType.SubAccounts.RemoveFromGroup);
export const selectSubAccountAction = simpleAction<number>(ActionType.SubAccounts.Select);
export const deselectSubAccountAction = simpleAction<number>(ActionType.SubAccounts.Deselect);
export const selectAllSubAccountsAction = simpleAction<null>(ActionType.SubAccounts.SelectAll);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<ISubAccount>>(
  ActionType.SubAccounts.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(
  ActionType.SubAccounts.Placeholders.RemoveFromState
);
export const addPlaceholdersToStateAction = simpleAction<number>(ActionType.SubAccounts.Placeholders.AddToState);
export const updatePlaceholderInStateAction = simpleAction<Table.SubAccountRow>(
  ActionType.SubAccounts.Placeholders.UpdateInState
);

export const updateSubAccountInStateAction = simpleAction<ISubAccount>(ActionType.SubAccounts.UpdateInState);
export const removeSubAccountFromStateAction = simpleAction<number>(ActionType.SubAccounts.RemoveFromState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const addSubAccountToStateAction = simpleAction<ISubAccount>(ActionType.SubAccounts.AddToState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.SubAccounts.AddErrors
);

/*
  Actiosn Pertaining to Account Sub Accounts Groups
*/
export const requestGroupsAction = simpleAction<null>(ActionType.SubAccounts.Groups.Request);
export const loadingGroupsAction = simpleAction<boolean>(ActionType.SubAccounts.Groups.Loading);
export const responseGroupsAction = simpleAction<Http.IListResponse<IGroup<ISimpleSubAccount>>>(
  ActionType.SubAccounts.Groups.Response
);
export const addGroupToStateAction = simpleAction<IGroup<ISimpleSubAccount>>(ActionType.SubAccounts.Groups.AddToState);
// Not currently used, because the reducer handles the logic, but we may need to use in the near future.
export const updateGroupInStateAction = simpleAction<IGroup<ISimpleSubAccount>>(
  ActionType.SubAccounts.Groups.UpdateInState
);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.SubAccounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(ActionType.SubAccounts.Groups.Deleting);
export const deleteGroupAction = simpleAction<number>(ActionType.SubAccounts.Groups.Delete);

/*
  Actions Pertaining to Sub Account Sub Accounts History
*/
export const requestSubAccountsHistoryAction = simpleAction<null>(ActionType.SubAccounts.History.Request);
export const loadingSubAccountsHistoryAction = simpleAction<boolean>(ActionType.SubAccounts.History.Loading);
export const responseSubAccountsHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.SubAccounts.History.Response
);
