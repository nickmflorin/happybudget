import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, take, cancel, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { redux } from "lib";

import { ActionType } from "../../actions";
import { loadingBudgetAction, updateBudgetInStateAction } from "../../actions/budget";
import * as actions from "../../actions/budget/subAccount";
import { createStandardSaga, createSubAccountTaskSet, createFringeTaskSet } from "../factories";

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Modules.ApplicationStore) => state.budget.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        api.getSubAccountSubAccountsHistory,
        subaccountId,
        {},
        { cancelToken: source.token }
      );
      yield put(actions.responseHistoryAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the sub account's sub accounts history.");
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
  const subaccountId = yield select((state: Modules.ApplicationStore) => state.budget.budget.subaccount.id);
  if (!isNil(subaccountId) && !isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(actions.replyingToCommentAction({ id: parent, value: true }));
    } else {
      yield put(actions.creatingCommentAction(true));
    }
    try {
      let response: Model.Comment;
      if (!isNil(parent)) {
        response = yield call(api.replyToComment, parent, data.text, { cancelToken: source.token });
      } else {
        response = yield call(api.createSubAccountComment, subaccountId, data, { cancelToken: source.token });
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
  const subaccountId = yield select((state: Modules.ApplicationStore) => state.budget.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(api.getSubAccountComments, subaccountId, { cancelToken: source.token });
      yield put(actions.responseCommentsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the sub account's comments.");
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

const fringesRootSaga = redux.sagas.factories.createTableSaga(
  {
    Request: ActionType.Budget.SubAccount.Fringes.Request,
    TableChanged: ActionType.Budget.SubAccount.Fringes.TableChanged
  },
  createFringeTaskSet<Model.Budget>(
    {
      response: actions.responseFringesAction,
      loading: actions.loadingFringesAction,
      addToState: actions.addFringeToStateAction,
      deleting: actions.deletingFringeAction,
      creating: actions.creatingFringeAction,
      updating: actions.updatingFringeAction,
      budget: {
        loading: loadingBudgetAction,
        updateInState: updateBudgetInStateAction
      }
    },
    {
      request: api.getBudgetFringes,
      create: api.createBudgetFringe,
      bulkUpdate: api.bulkUpdateBudgetFringes,
      bulkCreate: api.bulkCreateBudgetFringes,
      bulkDelete: api.bulkDeleteBudgetFringes
    },
    (state: Modules.ApplicationStore) => state.budget.budget.budget.id
  )
);

const tasks = createSubAccountTaskSet<Model.Budget>(
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
      updateInState: updateBudgetInStateAction
    },
    subaccount: {
      request: actions.requestSubAccountAction,
      response: actions.responseSubAccountAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.id,
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.table.data,
  (state: Modules.ApplicationStore) => state.budget.budget.autoIndex
);

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.handleSubAccountChange, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getSubAccount, action);
  }
}

const rootSubAccountSaga = createStandardSaga(
  {
    Request: ActionType.Budget.SubAccount.SubAccounts.Request,
    TableChanged: ActionType.Budget.SubAccount.TableChanged,
    Groups: {
      Request: ActionType.Budget.SubAccount.Groups.Request
    },
    Comments: {
      Request: ActionType.Budget.SubAccount.Comments.Request,
      Submit: ActionType.Budget.SubAccount.Comments.Create,
      Delete: ActionType.Budget.SubAccount.Comments.Delete,
      Edit: ActionType.Budget.SubAccount.Comments.Update
    },
    History: {
      Request: ActionType.Budget.SubAccount.History.Request
    }
  },
  {
    ...tasks,
    comments: {
      request: getCommentsTask,
      submit: submitCommentTask,
      delete: deleteCommentTask,
      edit: editCommentTask
    },
    history: {
      request: getHistoryTask
    }
  },
  watchForRequestSubAccountSaga,
  watchForSubAccountIdChangedSaga
);

export default function* rootSaga(): SagaIterator {
  yield spawn(rootSubAccountSaga);
  yield spawn(fringesRootSaga);
}
