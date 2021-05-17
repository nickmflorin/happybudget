import { Reducer } from "redux";
import { filter } from "lodash";
import { createModelListResponseReducer, createTablePlaceholdersReducer } from "lib/redux/factories";
import { FringeRowManager } from "lib/tabling/managers";
import { ActionType } from "../actions";
import { initialFringesState } from "../initialState";

const createRootReducer = <
  D extends Redux.Budgeting.BudgetDirective,
  S extends Redux.Budgeting.Budget.FringesStore | Redux.Budgeting.Template.FringesStore = D extends "Budget"
    ? Redux.Budgeting.Budget.FringesStore
    : Redux.Budgeting.Template.FringesStore
>(
  /* eslint-disable indent */
  directive: D
): Reducer<S, Redux.Action<any>> => {
  const listResponseReducer = createModelListResponseReducer<Model.Fringe, S>(
    {
      Response: ActionType[directive].Fringes.Response,
      Loading: ActionType[directive].Fringes.Loading,
      SetSearch: ActionType[directive].Fringes.SetSearch,
      UpdateInState: ActionType[directive].Fringes.UpdateInState,
      RemoveFromState: ActionType[directive].Fringes.RemoveFromState,
      AddToState: ActionType[directive].Fringes.AddToState,
      Select: ActionType[directive].Fringes.Select,
      Deselect: ActionType[directive].Fringes.Deselect,
      SelectAll: ActionType[directive].Fringes.SelectAll,
      Deleting: ActionType[directive].Fringes.Deleting,
      Updating: ActionType[directive].Fringes.Updating,
      Creating: ActionType[directive].Fringes.Creating
    },
    {
      strictSelect: false,
      initialState: initialFringesState as S,
      subReducers: {
        placeholders: createTablePlaceholdersReducer(
          {
            AddToState: ActionType[directive].Fringes.Placeholders.AddToState,
            RemoveFromState: ActionType[directive].Fringes.Placeholders.RemoveFromState,
            UpdateInState: ActionType[directive].Fringes.Placeholders.UpdateInState,
            Clear: ActionType[directive].Fringes.Placeholders.Clear
          },
          FringeRowManager
        )
      }
    }
  );
  return (state: S = initialFringesState as S, action: Redux.Action<any>): S => {
    let newState = listResponseReducer(state, action);

    if (action.type === ActionType[directive].Fringes.Placeholders.Activate) {
      const payload: Table.ActivatePlaceholderPayload<Model.Fringe> = action.payload;
      newState = {
        ...newState,
        placeholders: filter(
          newState.placeholders,
          (placeholder: Table.FringeRow) => placeholder.id !== action.payload.id
        ),
        data: [...newState.data, payload.model]
      };
    }
    return newState;
  };
};

export default createRootReducer;
