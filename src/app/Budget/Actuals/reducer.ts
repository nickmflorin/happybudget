import { combineReducers } from "redux";
import {
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createListResponseReducer,
  createTablePlaceholdersReducer
} from "store/factories";
import { ActualMapping } from "model/tableMappings";

import { ActionType } from "./actions";
import { initialActualsState } from "./initialState";

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
  actuals: createListResponseReducer<IActual, Redux.Actuals.IActualsStore>(
    {
      Response: ActionType.Actuals.Response,
      Request: ActionType.Actuals.Request,
      Loading: ActionType.Actuals.Loading,
      SetSearch: ActionType.Actuals.SetSearch,
      UpdateInState: ActionType.Actuals.UpdateInState,
      RemoveFromState: ActionType.Actuals.RemoveFromState,
      AddToState: ActionType.Actuals.AddToState,
      Select: ActionType.Actuals.Select,
      Deselect: ActionType.Actuals.Deselect,
      SelectAll: ActionType.Actuals.SelectAll
    },
    {
      referenceEntity: "actual",
      initialState: initialActualsState,
      keyReducers: {
        placeholders: createTablePlaceholdersReducer(
          {
            AddToState: ActionType.Actuals.Placeholders.AddToState,
            Activate: ActionType.Actuals.Placeholders.Activate,
            RemoveFromState: ActionType.Actuals.Placeholders.RemoveFromState,
            UpdateInState: ActionType.Actuals.Placeholders.UpdateInState
          },
          ActualMapping,
          { referenceEntity: "actual" }
        ),
        deleting: createModelListActionReducer(ActionType.Actuals.Deleting, {
          referenceEntity: "actual"
        }),
        updating: createModelListActionReducer(ActionType.Actuals.Updating, {
          referenceEntity: "actual"
        }),
        creating: createSimpleBooleanReducer(ActionType.Actuals.Creating)
      }
    }
  )
});

export default rootReducer;
