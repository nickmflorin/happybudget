import { SagaIterator } from "redux-saga";
import { spawn } from "redux-saga/effects";

import { redux } from "lib";

export const createStandardSaga = <R extends Table.Row, M extends Model.Model>(
  actions: Redux.ReadOnlyBudgetTableSideEffectActionMap,
  tasks: Redux.ReadOnlyBudgetTableTaskMap<R, M>,
  ...args: (() => SagaIterator)[]
) => {
  const groupsSaga = redux.sagas.factories.createStandardRequestSaga(actions.Groups.Request, tasks.requestGroups);

  function* rootSaga(): SagaIterator {
    yield spawn(groupsSaga);
    for (let i = 0; i < args.length; i++) {
      yield spawn(args[i]);
    }
  }
  return rootSaga;
};
