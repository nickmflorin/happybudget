import { simpleAction } from "store/actions";

export const ActionType = {
  Comments: {
    Loading: "calculator.budget.comments.Loading",
    Response: "calculator.budget.comments.Response",
    Request: "calculator.budget.comments.Request",
    Delete: "calculator.budget.comments.Delete",
    Edit: "calculator.budget.comments.Edit",
    Submit: "calculator.budget.comments.Submit",
    Submitting: "calculator.budget.comments.Submitting",
    Deleting: "calculator.budget.comments.Deleting",
    Editing: "calculator.budget.comments.Editing",
    Replying: "calculator.budget.comments.Replying",
    AddToState: "calculator.budget.comments.AddToState",
    RemoveFromState: "calculator.budget.comments.RemoveFromState",
    UpdateInState: "calculator.budget.comments.UpdateInState"
  },
  Accounts: {
    Deleting: "calculator.budget.accounts.Deleting",
    Creating: "calculator.budget.accounts.Creating",
    Updating: "calculator.budget.accounts.Updating",
    Update: "calculator.budget.accounts.Update",
    Remove: "calculator.budget.accounts.Remove",
    SetSearch: "calculator.budget.accounts.SetSearch",
    Loading: "calculator.budget.accounts.Loading",
    Select: "calculator.budget.accounts.Select",
    Deselect: "calculator.budget.accounts.Deselect",
    SelectAll: "calculator.budget.accounts.SelectAll",
    Response: "calculator.budget.accounts.Response",
    Request: "calculator.budget.accounts.Request",
    UpdateInState: "calculator.budget.accounts.UpdateInState",
    RemoveFromState: "calculator.budget.accounts.RemoveFromState",
    AddToState: "calculator.budget.accounts.AddToState",
    RemoveFromGroup: "calculator.budget.accounts.RemoveFromGroup",
    // Errors Functionality Needs to be Built Back In
    AddErrors: "calculator.budget.accounts.AddErrors",
    Placeholders: {
      AddToState: "calculator.budget.accounts.placeholders.AddToState",
      Activate: "calculator.budget.accounts.placeholders.Activate",
      UpdateInState: "calculator.budget.accounts.placeholders.UpdateInState",
      RemoveFromState: "calculator.budget.accounts.placeholders.RemoveFromState"
    },
    Groups: {
      Delete: "calculator.budget.accounts.groups.Delete",
      Deleting: "calculator.budget.accounts.groups.Deleting",
      AddToState: "calculator.budget.accounts.groups.AddToState",
      RemoveFromState: "calculator.budget.accounts.groups.RemoveFromState",
      UpdateInState: "calculator.budget.accounts.groups.UpdateInState"
    },
    History: {
      Loading: "calculator.budget.accounts.history.Loading",
      Response: "calculator.budget.accounts.history.Response",
      Request: "calculator.budget.accounts.history.Request",
      AddToState: "calculator.budget.accounts.history.AddToState"
    }
  }
};

/*
  Actions Pertaining to Budget Comments
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
export const deletingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Deleting);
export const editingCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Editing);
export const replyingToCommentAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Comments.Replying);
export const addCommentToStateAction = simpleAction<{ data: IComment; parent?: number }>(
  ActionType.Comments.AddToState
);
export const removeCommentFromStateAction = simpleAction<number>(ActionType.Comments.RemoveFromState);
export const updateCommentInStateAction = simpleAction<Redux.UpdateModelActionPayload<IComment>>(
  ActionType.Comments.UpdateInState
);

/*
  Actions Pertaining to Budget Accounts
*/
export const updateAccountAction = simpleAction<Table.RowChange>(ActionType.Accounts.Update);
export const removeAccountAction = simpleAction<number>(ActionType.Accounts.Remove);
export const deletingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Deleting);
export const updatingAccountAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Updating);
export const creatingAccountAction = simpleAction<boolean>(ActionType.Accounts.Creating);
export const requestAccountsAction = simpleAction<null>(ActionType.Accounts.Request);
export const loadingAccountsAction = simpleAction<boolean>(ActionType.Accounts.Loading);
export const responseAccountsAction = simpleAction<Http.IListResponse<IAccount>>(ActionType.Accounts.Response);
export const setAccountsSearchAction = simpleAction<string>(ActionType.Accounts.SetSearch);
export const removeAccountFromGroupAction = simpleAction<number>(ActionType.Accounts.RemoveFromGroup);
export const selectAccountAction = simpleAction<number>(ActionType.Accounts.Select);
export const deselectAccountAction = simpleAction<number>(ActionType.Accounts.Deselect);
export const selectAllAccountsAction = simpleAction<null>(ActionType.Accounts.SelectAll);

export const activatePlaceholderAction = simpleAction<Table.ActivatePlaceholderPayload<IAccount>>(
  ActionType.Accounts.Placeholders.Activate
);
export const removePlaceholderFromStateAction = simpleAction<number>(ActionType.Accounts.Placeholders.RemoveFromState);
export const addPlaceholdersToStateAction = simpleAction<number>(ActionType.Accounts.Placeholders.AddToState);
export const updatePlaceholderInStateAction = simpleAction<Table.AccountRow>(
  ActionType.Accounts.Placeholders.UpdateInState
);

export const addAccountToStateAction = simpleAction<IAccount>(ActionType.Accounts.AddToState);
export const updateAccountInStateAction = simpleAction<IAccount>(ActionType.Accounts.UpdateInState);
export const removeAccountFromStateAction = simpleAction<number>(ActionType.Accounts.RemoveFromState);

// Errors Functionality Needs to be Built Back In
export const addErrorsToStateAction = simpleAction<Table.CellError | Table.CellError[]>(ActionType.Accounts.AddErrors);

/*
  Actiosn Pertaining to Account Sub Accounts Groups
*/
export const addGroupToStateAction = simpleAction<IGroup<ISimpleAccount>>(ActionType.Accounts.Groups.AddToState);
export const updateGroupInStateAction = simpleAction<IGroup<ISimpleAccount>>(ActionType.Accounts.Groups.UpdateInState);
export const removeGroupFromStateAction = simpleAction<number>(ActionType.Accounts.Groups.RemoveFromState);
export const deletingGroupAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Accounts.Groups.Deleting);
export const deleteGroupAction = simpleAction<number>(ActionType.Accounts.Groups.Delete);

/*
  Actions Pertaining to Budget Accounts History
*/
export const requestAccountsHistoryAction = simpleAction<null>(ActionType.Accounts.History.Request);
export const loadingAccountsHistoryAction = simpleAction<boolean>(ActionType.Accounts.History.Loading);
export const responseAccountsHistoryAction = simpleAction<Http.IListResponse<HistoryEvent>>(
  ActionType.Accounts.History.Response
);
export const addAccountsHistoryToStateAction = simpleAction<HistoryEvent>(ActionType.Accounts.History.AddToState);
