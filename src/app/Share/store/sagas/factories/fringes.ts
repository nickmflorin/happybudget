import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";

type R = Tables.FringeRow;
type M = Model.Fringe;

export interface FringeTasksActionMap {
  response: Redux.ActionCreator<Http.ListResponse<M>>;
  loading: Redux.ActionCreator<boolean>;
  budget: {
    loading: Redux.ActionCreator<boolean>;
  };
}

export interface FringeServiceSet {
  request: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<M>>;
}

export type FringeTaskSet = Redux.ReadOnlyTableTaskMap<R, M>;

export const createFringeTaskSet = (
  actions: FringeTasksActionMap,
  services: FringeServiceSet,
  selectObjId: (state: Modules.Unauthenticated.StoreObj) => number | null
): FringeTaskSet => {
  function* getFringesTask(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(selectObjId);
    if (!isNil(objId)) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      yield put(actions.loading(true));
      try {
        const response = yield call(services.request, objId, { no_pagination: true }, { cancelToken: source.token });
        yield put(actions.response(response));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error retrieving fringes.");
          yield put(actions.response({ count: 0, data: [] }, { error: e }));
        }
      } finally {
        yield put(actions.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }
  return {
    request: getFringesTask
  };
};
