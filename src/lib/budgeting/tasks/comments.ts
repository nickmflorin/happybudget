import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { notifications } from "lib";

export const createListResponseTaskSet = (
  config: Redux.TaskConfig<Redux.CommentsListResponseActionMap>
): Redux.TaskMapObject<Redux.CommentsListResponseTaskMap> => {
  function* request(action: Redux.Action): SagaIterator {
    const budgetId = yield select((state: Application.Authenticated.Store) => state.budget.id);
    if (!isNil(budgetId)) {
      yield put(config.actions.loading(true));
      try {
        // TODO: We will have to build in pagination.
        const response = yield api.request(api.getBudgetComments, budgetId);
        yield put(config.actions.response(response));
      } catch (e: unknown) {
        notifications.requestError(e as Error, "There was an error retrieving the comments.");
        yield put(config.actions.response({ count: 0, data: [] }));
      } finally {
        yield put(config.actions.loading(false));
      }
    }
  }

  function* submit(action: Redux.Action<{ parent?: number; data: Http.CommentPayload }>): SagaIterator {
    const budgetId = yield select((state: Application.Authenticated.Store) => state.budget.id);
    if (!isNil(budgetId) && !isNil(action.payload)) {
      const { parent, data } = action.payload;
      if (!isNil(parent)) {
        yield put(config.actions.replying({ id: parent, value: true }));
      } else {
        yield put(config.actions.creating(true));
      }
      try {
        let response: Model.Comment;
        if (!isNil(parent)) {
          response = yield api.request(api.replyToComment, parent, data.text);
        } else {
          response = yield api.request(api.createBudgetComment, budgetId, data);
        }
        yield put(config.actions.addToState({ data: response, parent }));
      } catch (e: unknown) {
        notifications.requestError(e as Error, "There was an error submitting the comment.");
      } finally {
        if (!isNil(parent)) {
          yield put(config.actions.replying({ id: parent, value: false }));
        } else {
          yield put(config.actions.creating(false));
        }
      }
    }
  }

  function* deleteTask(action: Redux.Action<number>): SagaIterator {
    if (!isNil(action.payload)) {
      yield put(config.actions.deleting({ id: action.payload, value: true }));
      try {
        yield api.request(api.deleteComment, action.payload);
        yield put(config.actions.removeFromState(action.payload));
      } catch (e: unknown) {
        notifications.requestError(e as Error, "There was an error deleting the comment.");
      } finally {
        yield put(config.actions.deleting({ id: action.payload, value: false }));
      }
    }
  }

  function* edit(action: Redux.Action<Redux.UpdateActionPayload<Model.Comment>>): SagaIterator {
    if (!isNil(action.payload)) {
      const { id, data } = action.payload;
      yield put(config.actions.updating({ id, value: true }));
      try {
        // Here we are assuming that Partial<Model.Comment> can be mapped to Partial<Http.CommentPayload>,
        // which is the case right now but may not be in the future.
        const response: Model.Comment = yield api.request(api.updateComment, id, data as Partial<Http.CommentPayload>);
        yield put(config.actions.updateInState({ id, data: response }));
      } catch (e: unknown) {
        notifications.requestError(e as Error, "There was an error updating the comment.");
      } finally {
        yield put(config.actions.updating({ id, value: false }));
      }
    }
  }

  return { edit, delete: deleteTask, request, submit };
};
