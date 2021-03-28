import { simpleAction } from "store/actions";

export const ActionType = {
  Account: {
    SetId: "calculator.account.SetId",
    Loading: "calculator.account.Loading",
    Response: "calculator.account.Response",
    Request: "calculator.account.Request",
    UpdateInState: "calculator.account.UpdateInState"
  },
  Comments: {
    Loading: "calculator.account.comments.Loading",
    Response: "calculator.account.comments.Response",
    Request: "calculator.account.comments.Request",
    Submitting: "calculator.account.comments.Submitting",
    Deleting: "calculator.account.comments.Deleting",
    Editing: "calculator.account.comments.Editing",
    Replying: "calculator.account.comments.Replying",
    Delete: "calculator.account.comments.Delete",
    Edit: "calculator.account.comments.Edit",
    Submit: "calculator.account.comments.Submit",
    AddToState: "calculator.account.comments.AddToState",
    RemoveFromState: "calculator.account.comments.RemoveFromState",
    UpdateInState: "calculator.account.comments.UpdateInState"
  },
  SubAccounts: {
    Deleting: "calculator.account.subaccounts.Deleting",
    Creating: "calculator.account.subaccounts.Creating",
    Updating: "calculator.account.subaccounts.Updating",
    Update: "calculator.account.subaccounts.Update",
    Remove: "calculator.account.subaccounts.Remove",
    SetSearch: "calculator.account.subaccounts.SetSearch",
    Loading: "calculator.account.subaccounts.Loading",
    Select: "calculator.account.subaccounts.Select",
    Deselect: "calculator.account.subaccounts.Deselect",
    SelectAll: "calculator.account.subaccounts.SelectAll",
    Response: "calculator.account.subaccounts.Response",
    Request: "calculator.account.subaccounts.Request",
    UpdateInState: "calculator.account.subaccounts.UpdateInState",
    RemoveFromState: "calculator.account.subaccounts.RemoveFromState",
    AddToState: "calculator.account.subaccounts.AddToState",
    RemoveFromGroup: "calculator.account.subaccounts.RemoveFromGroup",
    // Errors Functionality Needs to be Built Back In
    AddErrors: "calculator.account.subaccounts.AddErrors",
    Placeholders: {
      AddToState: "calculator.account.subaccounts.placeholders.AddToState",
      Activate: "calculator.account.subaccounts.placeholders.Activate",
      UpdateInState: "calculator.account.subaccounts.placeholders.UpdateInState",
      RemoveFromState: "calculator.account.subaccounts.placeholders.RemoveFromState"
    },
    Groups: {
      Delete: "calculator.account.subaccounts.groups.Delete",
      Deleting: "calculator.account.subaccounts.groups.Deleting",
      AddToState: "calculator.account.subaccounts.groups.AddToState",
      RemoveFromState: "calculator.account.subaccounts.groups.RemoveFromState",
      UpdateInState: "calculator.account.subaccounts.groups.UpdateInState"
    },
    History: {
      Loading: "calculator.account.subaccounts.history.Loading",
      Response: "calculator.account.subaccounts.history.Response",
      Request: "calculator.account.subaccounts.history.Request"
    }
  }
};

export const setAccountIdAction = simpleAction<number>(ActionType.Account.SetId);
export const requestAccountAction = simpleAction<null>(ActionType.Account.Request);
export const loadingAccountAction = simpleAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = simpleAction<IAccount>(ActionType.Account.Response);
export const updateAccountInStateAction = simpleAction<Partial<IAccount>>(ActionType.Account.UpdateInState);

/*
  Actions Pertaining to Account Comments
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

export const addSubAccountToStateAction = simpleAction<ISubAccount>(ActionType.SubAccounts.AddToState);
export const updateSubAccountInStateAction = simpleAction<ISubAccount>(ActionType.SubAccounts.UpdateInState);
export const removeSubAccountFromStateAction = simpleAction<number>(ActionType.SubAccounts.RemoveFromState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(
  ActionType.SubAccounts.AddErrors
);

/*
  Actiosn Pertaining to Account Sub Accounts Groups
*/
export const addGroupToStateAction = simpleAction<IGroup<ISimpleSubAccount>>(ActionType.SubAccounts.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<INestedGroup>(ActionType.SubAccounts.Groups.UpdateInState);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.SubAccounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(ActionType.SubAccounts.Groups.Deleting);
export const deleteGroupAction = simpleAction<number>(ActionType.SubAccounts.Groups.Delete);

/*
  Actions Pertaining to Account Sub Accounts History
*/
export const requestSubAccountsHistoryAction = simpleAction<null>(ActionType.SubAccounts.History.Request);
export const loadingSubAccountsHistoryAction = simpleAction<boolean>(ActionType.SubAccounts.History.Loading);
export const responseSubAccountsHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.SubAccounts.History.Response
);
