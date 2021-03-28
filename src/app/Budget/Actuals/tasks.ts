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
import { requestBudgetAction } from "../actions";
import {
  activatePlaceholderAction,
  loadingActualsAction,
  responseActualsAction,
  updateTableRowAction,
  addErrorsToTableAction,
  addPlaceholdersAction,
  removeTableRowAction,
  deletingActualAction,
  creatingActualAction,
  updatingActualAction,
  loadingBudgetItemsAction,
  responseBudgetItemsAction,
  loadingBudgetItemsTreeAction,
  responseBudgetItemsTreeAction
} from "./actions";

export function* handleActualRemovalTask(action: Redux.IAction<Table.ActualRow>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(removeTableRowAction(action.payload));
    // NOTE: We cannot find the existing row from the table in state because the
    // dispatched action above will remove the row from the table.
    if (action.payload.meta.isPlaceholder === false) {
      yield put(deletingActualAction({ id: action.payload.id as number, value: true }));
      try {
        yield call(deleteActual, action.payload.id as number);
      } catch (e) {
        handleRequestError(e, "There was an error deleting the actual.");
      } finally {
        yield put(deletingActualAction({ id: action.payload.id as number, value: false }));
      }
    }
  }
}

export function* handleActualUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(action.payload) && !isNil(budgetId)) {
    const table: Table.ActualRow[] = yield select((state: Redux.IApplicationStore) => state.actuals.actuals.table);

    const existing: Table.ActualRow | undefined = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating actual in state...
        the actual with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      // There are some cases where we need to update the row in the table before
      // we make the request, to improve the UI.  This happens for cells where the
      // value is rendered via an HTML element (i.e. the Unit Cell).  AGGridReact will
      // not automatically update the cell when the Unit is changed via the dropdown,
      // so we need to udpate the row in the data used to populate the table.  We could
      // do this by updating with a payload generated from the response, but it is quicker
      // to do it before hand.
      const preResponsePayload = ActualMapping.preRequestPayload(action.payload);
      if (Object.keys(preResponsePayload).length !== 0) {
        yield put(
          updateTableRowAction({
            id: existing.id,
            data: preResponsePayload
          })
        );
      }
      if (existing.meta.isPlaceholder === true) {
        const updatedRow = { ...existing, ...ActualMapping.patchPayload(action.payload) } as Table.ActualRow;
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (ActualMapping.rowHasRequiredFields(updatedRow)) {
          yield put(creatingActualAction(true));
          const payload = ActualMapping.postPayload(updatedRow);
          if (!isNil(updatedRow.object_id)) {
            let service = createAccountActual;
            if (updatedRow.parent_type === "subaccount") {
              service = createSubAccountActual;
            }
            try {
              const response: IActual = yield call(service, updatedRow.object_id, payload);
              yield put(activatePlaceholderAction({ id: existing.id, model: response }));
              const responsePayload = ActualMapping.modelToRow(response);
              if (Object.keys(responsePayload).length !== 0) {
                yield put(updateTableRowAction({ id: response.id, data: responsePayload }));
              }
            } catch (e) {
              yield call(
                handleTableErrors,
                e,
                "There was an error updating the actual.",
                existing.id,
                (errors: Table.CellError[]) => addErrorsToTableAction(errors)
              );
            } finally {
              yield put(creatingActualAction(false));
            }
          }
        }
      } else {
        yield put(updatingActualAction({ id: existing.id as number, value: true }));
        const requestPayload = ActualMapping.patchPayload(action.payload);
        try {
          const response: IActual = yield call(updateActual, existing.id as number, requestPayload);
          const responsePayload = ActualMapping.modelToRow(response);
          yield put(updateTableRowAction({ id: existing.id, data: responsePayload }));

          // Determine if the parent budget needs to be refreshed due to updates to the underlying
          // actual fields that calculate the values of the parent budget.
          if (ActualMapping.patchRequestRequiresRecalculation(requestPayload)) {
            yield put(requestBudgetAction());
          }
        } catch (e) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the actual.",
            existing.id,
            (errors: Table.CellError[]) => addErrorsToTableAction(errors)
          );
        } finally {
          yield put(updatingActualAction({ id: existing.id as number, value: false }));
        }
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
        yield put(addPlaceholdersAction(2));
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
