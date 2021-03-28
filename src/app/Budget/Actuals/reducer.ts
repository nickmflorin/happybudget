import { combineReducers } from "redux";
import {
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createTableReducer,
  createListResponseReducer
} from "store/factories";
import { ActualMapping } from "model/tableMappings";

import { ActionType } from "./actions";

const rootReducer = combineReducers({
  budgetItems: createListResponseReducer<IBudgetItem>(
    {
      Response: ActionType.BudgetItems.Response,
      Request: ActionType.BudgetItems.Request,
      Loading: ActionType.BudgetItems.Loading
    },
    { referenceEntity: "budget item" }
  ),
  budgetItemsTree: createListResponseReducer<IBudgetItemNode>(
    {
      Response: ActionType.BudgetItemsTree.Response,
      Request: ActionType.BudgetItemsTree.Request,
      Loading: ActionType.BudgetItemsTree.Loading
    },
    { referenceEntity: "budget item tree node" }
  ),
  actuals: createListResponseReducer<ISubAccount>(
    {
      Response: ActionType.Actuals.Response,
      Request: ActionType.Actuals.Request,
      Loading: ActionType.Actuals.Loading,
      SetSearch: ActionType.Actuals.SetSearch
    },
    {
      referenceEntity: "actual",
      keyReducers: {
        deleting: createModelListActionReducer(ActionType.Actuals.Deleting, {
          referenceEntity: "actual"
        }),
        updating: createModelListActionReducer(ActionType.Actuals.Updating, {
          referenceEntity: "actual"
        }),
        creating: createSimpleBooleanReducer(ActionType.Actuals.Creating),
        table: createTableReducer<Table.ActualRow, IActual, Http.IActualPayload>(
          {
            AddPlaceholders: ActionType.Actuals.AddPlaceholders,
            RemoveRow: ActionType.Actuals.RemoveRow,
            UpdateRow: ActionType.Actuals.UpdateRow,
            AddToState: ActionType.Actuals.ActivatePlaceholder,
            SelectRow: ActionType.Actuals.SelectRow,
            DeselectRow: ActionType.Actuals.DeselectRow,
            SelectAllRows: ActionType.Actuals.SelectAllRows,
            SetData: ActionType.Actuals.Response,
            ClearData: ActionType.Actuals.Request,
            Loading: ActionType.Actuals.Loading,
            AddErrors: ActionType.Actuals.AddErrors
          },
          ActualMapping,
          { referenceEntity: "actual" }
        )
      }
    }
  )
});

export default rootReducer;
