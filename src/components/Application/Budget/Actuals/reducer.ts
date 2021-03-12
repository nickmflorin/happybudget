import { combineReducers } from "redux";
import {
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createTableReducer,
  createListResponseReducer
} from "store/reducerFactories";
import { ActionType } from "./actions";
import { createActualRowPlaceholder, initializeRowFromActual } from "./util";

const rootReducer = combineReducers({
  deleting: createModelListActionReducer(ActionType.Deleting, { referenceEntity: "actual" }),
  updating: createModelListActionReducer(ActionType.Updating, { referenceEntity: "actual" }),
  creating: createSimpleBooleanReducer(ActionType.Creating),
  budgetItems: createListResponseReducer<IBudgetItem>(
    {
      Response: ActionType.BudgetItems.Response,
      Request: ActionType.BudgetItems.Request,
      Loading: ActionType.BudgetItems.Loading
    },
    { referenceEntity: "budget item" }
  ),
  table: createTableReducer<Table.ActualRowField, Table.IActualRowMeta, Table.IActualRow, IActual>(
    {
      AddPlaceholders: ActionType.ActualsTable.AddPlaceholders,
      RemoveRow: ActionType.ActualsTable.RemoveRow,
      UpdateRow: ActionType.ActualsTable.UpdateRow,
      ActivatePlaceholder: ActionType.ActualsTable.ActivatePlaceholder,
      SelectRow: ActionType.ActualsTable.SelectRow,
      DeselectRow: ActionType.ActualsTable.DeselectRow,
      SelectAllRows: ActionType.ActualsTable.SelectAllRows,
      Request: ActionType.ActualsTable.Request,
      Response: ActionType.ActualsTable.Response,
      Loading: ActionType.ActualsTable.Loading,
      SetSearch: ActionType.ActualsTable.SetSearch,
      AddErrors: ActionType.ActualsTable.AddErrors
    },
    createActualRowPlaceholder,
    initializeRowFromActual,
    { referenceEntity: "actual" }
  )
});

export default rootReducer;
