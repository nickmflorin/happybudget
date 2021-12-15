import { Saga, SagaMiddleware, Task } from "redux-saga";
import { isNil } from "lodash";

const createSagaManager = (
  runSaga: SagaMiddleware["run"],
  rootSaga: Saga<any[]>
): [(key: string, saga: Saga<any[]>) => boolean, (key: string) => boolean] => {
  const injectedSagas = new Map<string, Task>();

  const isInjected = (key: string) => injectedSagas.has(key);

  const injectSaga = (key: string, saga: Saga<any[]>): boolean => {
    if (!isInjected(key)) {
      /* Sagas return tasks when they are executed - which can be used to cancel
			   them... we might want to look into this for when we eject the saga. */
      const task = runSaga(saga);
      injectedSagas.set(key, task);
      return true;
    }
    return false;
  };

  const ejectSaga = (key: string): boolean => {
    /* When ejecting a Saga, we only want to cancel any outstanding tasks.  We
		   do not want to remove the Saga from `injectedSagas` because the Saga is
		   still running in the middleware - and if we remove it from `injectedSagas`
		   we will have multiple sagas running. */
    const task = injectedSagas.get(key);
    if (!isNil(task)) {
      task.cancel();
      return true;
    }
    return false;
  };

  injectSaga("root", rootSaga);
  return [injectSaga, ejectSaga];
};

export default createSagaManager;
