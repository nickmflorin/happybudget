import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, take, cancel, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";

import { ActionType } from "../../actions";
import { loadingBudgetAction, requestBudgetAction } from "../../actions/budget";
import * as actions from "../../actions/budget/account";
import { createStandardSaga, createStandardFringesSaga, createAccountTaskSet, createFringeTaskSet } from "../factories";

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        api.getAccountSubAccountsHistory,
        accountId,
        {},
        { cancelToken: source.token }
      );
      yield put(actions.responseHistoryAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the account's sub accounts history.");
      }
    } finally {
      yield put(actions.loadingHistoryAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* submitCommentTask(action: Redux.Action<{ parent?: number; data: Http.CommentPayload }>): SagaIterator {
  const accountId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
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
        response = yield call(api.createAccountComment, accountId, data, { cancelToken: source.token });
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

export function* getCommentsTask(action: Redux.Action<any>): SagaIterator {
  const accountId = yield select((state: Modules.ApplicationStore) => state.budgeting.budget.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(api.getAccountComments, accountId, { cancelToken: source.token });
      yield put(actions.responseCommentsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the account's comments.");
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

const fringeTasks = createFringeTaskSet<Model.Budget>(
  {
    response: actions.responseFringesAction,
    loading: actions.loadingFringesAction,
    addToState: actions.addFringeToStateAction,
    deleting: actions.deletingFringeAction,
    creating: actions.creatingFringeAction,
    updating: actions.updatingFringeAction,
    requestBudget: requestBudgetAction
  },
  {
    request: api.getBudgetFringes,
    create: api.createBudgetFringe,
    bulkUpdate: api.bulkUpdateBudgetFringes,
    bulkCreate: api.bulkCreateBudgetFringes,
    bulkDelete: api.bulkDeleteBudgetFringes
  },
  (state: Modules.ApplicationStore) => state.budgeting.budget.budget.id,
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.fringes.data
);

const fringesRootSaga = createStandardFringesSaga(
  {
    Request: ActionType.Budget.Account.Fringes.Request,
    TableChanged: ActionType.Budget.Account.Fringes.TableChanged
  },
  fringeTasks
);

const tasks = createAccountTaskSet(
  {
    loading: actions.loadingSubAccountsAction,
    deleting: actions.deletingSubAccountAction,
    creating: actions.creatingSubAccountAction,
    updating: actions.updatingSubAccountAction,
    request: actions.requestSubAccountsAction,
    response: actions.responseSubAccountsAction,
    addToState: actions.addSubAccountToStateAction,
    budget: {
      loading: loadingBudgetAction,
      request: requestBudgetAction
    },
    account: {
      request: actions.requestAccountAction,
      loading: actions.loadingAccountAction,
      response: actions.responseAccountAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
      removeFromState: actions.removeGroupFromStateAction,
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.id,
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.data,
  (state: Modules.ApplicationStore) => state.budgeting.budget.autoIndex
);

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getAccount, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.handleAccountChange, action);
  }
}

const rootAccountSaga = createStandardSaga(
  {
    Request: ActionType.Budget.Account.SubAccounts.Request,
    TableChange: ActionType.Budget.Account.TableChanged,
    Groups: {
      Request: ActionType.Budget.Account.SubAccounts.Groups.Request,
      RemoveModel: ActionType.Budget.Account.SubAccounts.RemoveFromGroup,
      AddModel: ActionType.Budget.Account.SubAccounts.AddToGroup,
      Delete: ActionType.Budget.Account.SubAccounts.Groups.Delete
    },
    Comments: {
      Request: ActionType.Budget.Account.Comments.Request,
      Submit: ActionType.Budget.Account.Comments.Create,
      Delete: ActionType.Budget.Account.Comments.Delete,
      Edit: ActionType.Budget.Account.Comments.Update
    },
    History: {
      Request: ActionType.Budget.Account.SubAccounts.History.Request
    }
  },
  {
    Request: tasks.getSubAccounts,
    HandleDataChangeEvent: tasks.handleDataChangeEvent,
    HandleRowAddEvent: tasks.handleRowAddEvent,
    HandleRowDeleteEvent: tasks.handleRowDeleteEvent,
    Groups: {
      Request: tasks.getGroups,
      RemoveModel: tasks.removeFromGroup,
      AddModel: tasks.addToGroup,
      Delete: tasks.deleteGroup
    },
    Comments: {
      Request: getCommentsTask,
      Submit: submitCommentTask,
      Delete: deleteCommentTask,
      Edit: editCommentTask
    },
    History: {
      Request: getHistoryTask
    }
  },
  watchForRequestAccountSaga,
  watchForAccountIdChangedSaga
);

export default function* rootSaga(): SagaIterator {
  yield spawn(rootAccountSaga);
  yield spawn(fringesRootSaga);
}
