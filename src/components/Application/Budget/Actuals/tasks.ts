import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { isNil, find } from "lodash";
import {
  getBudgetActuals,
  deleteActual,
  updateActual,
  getBudgetItems,
  createAccountActual,
  createSubAccountActual
} from "services";
import { handleRequestError, handleTableErrors } from "store/tasks";
import {
  loadingActualsAction,
  responseActualsAction,
  updateActualsTableCellAction,
  addErrorsToActualsTableAction,
  addActualsTablePlaceholdersAction,
  removeActualsTableRowAction,
  deletingActualAction,
  creatingActualAction,
  updatingActualAction,
  loadingBudgetItemsAction,
  responseBudgetItemsAction
} from "./actions";
import {
  payloadFromResponse,
  postPayloadFromRow,
  rowHasRequiredFields,
  requestWarrantsParentRefresh,
  payloadBeforeResponse
} from "../util";

export function* handleActualRemovalTask(action: Redux.IAction<Table.IActualRow>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(removeActualsTableRowAction(action.payload));
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

export function* handleActualUpdateTask(
  action: Redux.IAction<{ id: number; data: Partial<Table.IActualRow> }>
): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(action.payload) && !isNil(action.payload.id) && !isNil(action.payload.data) && !isNil(budgetId)) {
    const table: Table.IActualRow[] = yield select((state: Redux.IApplicationStore) => state.actuals.table.data);

    const existing: Table.IActualRow | undefined = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating actual in state...
        the actual with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      if (existing.meta.isPlaceholder === true) {
        const payload = postPayloadFromRow<Table.IActualRow, Http.IActualPayload>(existing, "actual");
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (rowHasRequiredFields<Table.IActualRow>(existing, "actual")) {
          yield put(creatingActualAction(true));
          // try {
          //   const response: IActual = yield call(createActual, action.budgetId, payload as Http.IAccountPayload);
          //   yield put(activateActualsPlaceholderAction({ oldId: existing.id, id: response.id }));
          //   const updates = convertActualResponseToCellUpdates(response);
          //   yield put(updateActualsCellAction(updates));
          // } catch (e) {
          //   // TODO: Should we revert the changes if there was an error?
          //   handleRequestError(e, "There was an error updating the actual.");
          // } finally {
          //   yield put(creatingActualAction(false));
          // }
        }
      } else {
        yield put(updatingActualAction({ id: existing.id as number, value: true }));
        try {
          const response: IActual = yield call(
            updateActual,
            existing.id as number,
            action.payload.data as Partial<Http.IActualPayload>
          );
          const responsePayload = payloadFromResponse<IActual>(response, "actual");
          yield put(updateActualsTableCellAction({ id: existing.id, data: responsePayload }));
        } catch (e) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the actual.",
            existing.id,
            (errors: Table.ICellError[]) => addErrorsToActualsTableAction(errors)
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
        yield put(addActualsTablePlaceholdersAction(2));
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
      console.log(response);
      yield put(responseBudgetItemsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's items.");
      yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingBudgetItemsAction(false));
    }
  }
}
