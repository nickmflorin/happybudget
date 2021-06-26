import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import * as models from "lib/model";

import { userToSimpleUser } from "lib/model/mappings";
import { nowAsString } from "lib/util/dates";
import { generateRandomNumericId } from "lib/util";

import { ActionType } from "../../actions";
import { requestBudgetAction, loadingBudgetAction } from "../../actions/budget";
import * as actions from "../../actions/budget/accounts";
import { createStandardSaga, createAccountsTaskSet } from "../factories";

export function* getCommentsTask(action: Redux.Action<any>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(api.getBudgetComments, budgetId, { cancelToken: source.token });
      yield put(actions.responseCommentsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the budget's comments.");
        yield put(actions.responseCommentsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(actions.loadingCommentsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* submitCommentTask(action: Redux.Action<{ parent?: number; data: Http.CommentPayload }>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(actions.replyingToCommentAction({ id: parent, value: true }));
    } else {
      yield put(actions.creatingCommentAction(true));
    }
    try {
      let response: Comment;
      if (!isNil(parent)) {
        response = yield call(api.replyToComment, parent, data.text, { cancelToken: source.token });
      } else {
        response = yield call(api.createBudgetComment, budgetId, data, { cancelToken: source.token });
      }
      yield put(actions.addCommentToStateAction({ data: response, parent }));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error submitting the comment.");
      }
    } finally {
      if (!isNil(parent)) {
        yield put(actions.replyingToCommentAction({ id: parent, value: false }));
      } else {
        yield put(actions.creatingCommentAction(false));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* deleteCommentTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.deletingCommentAction({ id: action.payload, value: true }));
    try {
      yield call(api.deleteComment, action.payload, { cancelToken: source.token });
      yield put(actions.removeCommentFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error deleting the comment.");
      }
    } finally {
      yield put(actions.deletingCommentAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* editCommentTask(action: Redux.Action<Redux.UpdateModelActionPayload<Model.Comment>>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { id, data } = action.payload;
    yield put(actions.updatingCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<Model.Comment> can be mapped to Partial<Http.CommentPayload>,
      // which is the case right now but may not be in the future.
      const response: Model.Comment = yield call(api.updateComment, id, data as Partial<Http.CommentPayload>, {
        cancelToken: source.token
      });
      yield put(actions.updateCommentInStateAction({ id, data: response }));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error updating the comment.");
      }
    } finally {
      yield put(actions.updatingCommentAction({ id, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingAccountsHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        api.getAccountsHistory,
        budgetId,
        {},
        { cancelToken: source.token }
      );
      yield put(actions.responseAccountsHistoryAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the accounts history.");
      }
    } finally {
      yield put(actions.loadingAccountsHistoryAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* addToHistoryState(
  account: Model.BudgetAccount,
  eventType: Model.HistoryEventType,
  data?: { field: string; newValue: string | number; oldValue: string | number | null }
): SagaIterator {
  const user = yield select((state: Modules.ApplicationStore) => state.user);
  const polymorphicEvent: Model.PolymorphicEvent = {
    id: generateRandomNumericId(),
    created_at: nowAsString(),
    type: eventType,
    user: userToSimpleUser(user),
    content_object: {
      id: account.id,
      identifier: account.identifier,
      description: account.description,
      type: "account"
    }
  };
  if (eventType === "field_alteration") {
    if (!isNil(data)) {
      yield put(
        actions.addAccountsHistoryToStateAction({
          ...polymorphicEvent,
          new_value: data.newValue,
          old_value: data.oldValue,
          field: data.field
        })
      );
    }
  } else {
    yield put(actions.addAccountsHistoryToStateAction(polymorphicEvent as Model.CreateEvent));
  }
}

const tasks = createAccountsTaskSet<
  Model.Budget,
  Model.BudgetAccount,
  BudgetTable.BudgetAccountRow,
  Model.BudgetGroup,
  Http.BudgetAccountPayload
>(
  {
    loading: actions.loadingAccountsAction,
    deleting: actions.deletingAccountAction,
    creating: actions.creatingAccountAction,
    updating: actions.updatingAccountAction,
    response: actions.responseAccountsAction,
    addToState: actions.addAccountToStateAction,
    removeFromState: actions.removeAccountFromStateAction,
    budget: {
      loading: loadingBudgetAction,
      request: requestBudgetAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
      removeFromState: actions.removeGroupFromStateAction,
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction
    }
  },
  {
    getAccounts: api.getBudgetAccounts,
    getGroups: api.getBudgetAccountGroups,
    bulkUpdate: api.bulkUpdateBudgetAccounts,
    bulkCreate: api.bulkCreateBudgetAccounts,
    bulkDelete: api.bulkDeleteBudgetAccounts
  },
  models.BudgetAccountRowManager,
  (state: Modules.ApplicationStore) => state.budgeting.budget.budget.id,
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.data,
  (state: Modules.ApplicationStore) => state.budgeting.budget.autoIndex
);

export default createStandardSaga({
  Request: {
    actionType: ActionType.Budget.Accounts.Request,
    task: tasks.getAccounts
  },
  RequestGroups: {
    actionType: ActionType.Budget.Accounts.Groups.Request,
    task: tasks.getGroups
  },
  RequestComments: {
    actionType: ActionType.Budget.Comments.Request,
    task: getCommentsTask
  },
  RequestHistory: {
    actionType: ActionType.Budget.Accounts.History.Request,
    task: getHistoryTask
  },
  TableChanged: { actionType: ActionType.Budget.Accounts.TableChanged, task: tasks.handleTableChange },
  BulkCreate: { actionType: ActionType.Budget.Accounts.BulkCreate, task: tasks.bulkCreate },
  Delete: { actionType: ActionType.Budget.Accounts.Delete, task: tasks.handleRemoval },
  SubmitComment: { actionType: ActionType.Budget.Comments.Create, task: submitCommentTask },
  DeleteComment: { actionType: ActionType.Budget.Comments.Delete, task: deleteCommentTask },
  EditComment: { actionType: ActionType.Budget.Comments.Update, task: editCommentTask },
  DeleteGroup: { actionType: ActionType.Budget.Accounts.Groups.Delete, task: tasks.deleteGroup },
  RemoveModelFromGroup: { actionType: ActionType.Budget.Accounts.RemoveFromGroup, task: tasks.removeFromGroup },
  AddModelToGroup: { actionType: ActionType.Budget.Accounts.AddToGroup, task: tasks.addToGroup }
});
