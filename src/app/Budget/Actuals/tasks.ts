import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { isNil, find } from "lodash";
import { handleRequestError } from "api";
import { ActualMapping } from "model/tableMappings";
import {
  getBudgetActuals,
  deleteActual,
  updateActual,
  getBudgetItems,
  getBudgetItemsTree,
  createAccountActual,
  createSubAccountActual
} from "services";
import { handleTableErrors } from "store/tasks";
import {
  activatePlaceholderAction,
  loadingActualsAction,
  responseActualsAction,
  deletingActualAction,
  creatingActualAction,
  updatingActualAction,
  loadingBudgetItemsAction,
  responseBudgetItemsAction,
  loadingBudgetItemsTreeAction,
  responseBudgetItemsTreeAction,
  removePlaceholderFromStateAction,
  removeActualFromStateAction,
  addActualToStateAction,
  updatePlaceholderInStateAction,
  addPlaceholdersToStateAction,
  addErrorsToStateAction,
  updateActualInStateAction
} from "./actions";

// TODO: We need to also update the estimated, variance and actual values of the parent
// budget when an actual is removed!
export function* handleActualRemovalTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const models: IActual[] = yield select((state: Redux.IApplicationStore) => state.actuals.actuals.data);
    const model: IActual | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.IApplicationStore) => state.actuals.actuals.placeholders);
      const placeholder: Table.ActualRow | undefined = find(placeholders, { id: action.payload });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.warn(
          `Inconsistent State!  Inconsistent state noticed when removing actual...
          The actual with ID ${action.payload} does not exist in state when it is expected to.`
        );
      } else {
        yield put(removePlaceholderFromStateAction(placeholder.id));
      }
    } else {
      yield put(removeActualFromStateAction(model.id));
      yield put(deletingActualAction({ id: model.id, value: true }));
      try {
        yield call(deleteActual, model.id);
      } catch (e) {
        handleRequestError(e, "There was an error deleting the actual.");
      } finally {
        yield put(deletingActualAction({ id: model.id, value: false }));
      }
    }
  }
}

// TODO: We need to update the calculated values on the budget when the actual is updated!
export function* handleActualUpdatedInStateTask(action: Redux.IAction<IActual>): SagaIterator {
  if (!isNil(action.payload)) {
    const actual = action.payload;
    const budget: IBudget | undefined = yield select(
      (state: Redux.IApplicationStore) => state.budget.budget.detail.data
    );
  }
}

// TODO: We need to update the calculated values on the budget when the actual is updated!
export function* handleActualPlaceholderActivatedTask(
  action: Redux.IAction<Table.ActivatePlaceholderPayload<IActual>>
): SagaIterator {
  if (!isNil(action.payload)) {
    const account = action.payload.model;

    // Now that the placeholder is activated, we need to remove the placeholder from state and
    // insert in the actual Actual model into the state.
    yield put(removePlaceholderFromStateAction(account.id));
    yield put(addActualToStateAction(account));
  }
}

export function* handleActualUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: IActual[] = yield select((state: Redux.IApplicationStore) => state.actuals.actuals.data);
    const model: IActual | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.IApplicationStore) => state.actuals.actuals.placeholders);
      const placeholder: Table.ActualRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating actual in state...
          the actual with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        // There are some cases where we need to update the row in the table before we make the request,
        // to improve the UI.  This happens for cells where the value is rendered via an HTML element
        // (i.e. the Unit Cell).  AGGridReact will not automatically update the cell when the Unit is
        // changed via the dropdown, so we need to udpate the row in the data used to populate the table.
        // We could do this by updating with a payload generated from the response, but it is quicker
        // to do it before hand.
        const updatedRow = ActualMapping.newRowWithChanges(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction(updatedRow));

        if (ActualMapping.rowHasRequiredFields(updatedRow) && !isNil(updatedRow.object_id)) {
          let service = createAccountActual;
          if (updatedRow.parent_type === "subaccount") {
            service = createSubAccountActual;
          }
          yield put(creatingActualAction(true));
          try {
            const response: IActual = yield call(service, updatedRow.object_id, ActualMapping.postPayload(updatedRow));
            yield put(activatePlaceholderAction({ id: placeholder.id, model: response }));
          } catch (e) {
            yield call(
              handleTableErrors,
              e,
              "There was an error updating the actual.",
              placeholder.id,
              (errors: Table.CellError[]) => addErrorsToStateAction(errors)
            );
          } finally {
            yield put(creatingActualAction(false));
          }
        }
      }
    } else {
      // There are some cases where we need to update the row in the table before we make the request,
      // to improve the UI.  This happens for cells where the value is rendered via an HTML element
      // (i.e. the Unit Cell).  AGGridReact will not automatically update the cell when the Unit is
      // changed via the dropdown, so we need to udpate the row in the data used to populate the table.
      // We could do this by updating with a payload generated from the response, but it is quicker
      // to do it before hand.
      const preResponsePayload = ActualMapping.preRequestModelPayload(action.payload);
      yield put(updateActualInStateAction({ ...model, ...preResponsePayload }));

      yield put(updatingActualAction({ id: model.id, value: true }));
      const requestPayload = ActualMapping.patchPayload(action.payload);
      try {
        const response: IActual = yield call(updateActual, model.id, requestPayload);
        yield put(updateActualInStateAction(response));
      } catch (e) {
        yield call(
          handleTableErrors,
          e,
          "There was an error updating the actual.",
          model.id,
          (errors: Table.CellError[]) => addErrorsToStateAction(errors)
        );
      } finally {
        yield put(updatingActualAction({ id: model.id, value: false }));
      }
    }
  }
}

export function* getActualsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingActualsAction(true));
    try {
      const response = yield call(getBudgetActuals, budgetId, { no_pagination: true });
      yield put(responseActualsAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersToStateAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's actuals.");
      yield put(responseActualsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingActualsAction(false));
    }
  }
}

export function* getBudgetItemsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingBudgetItemsAction(true));
    try {
      const response = yield call(getBudgetItems, budgetId, { no_pagination: true });
      yield put(responseBudgetItemsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's items.");
      yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingBudgetItemsAction(false));
    }
  }
}

export function* getBudgetItemsTreeTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingBudgetItemsTreeAction(true));
    try {
      const response = yield call(getBudgetItemsTree, budgetId, { no_pagination: true });
      yield put(responseBudgetItemsTreeAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's items.");
      yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingBudgetItemsTreeAction(false));
    }
  }
}
