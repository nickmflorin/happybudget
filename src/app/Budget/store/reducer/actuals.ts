import { Reducer } from "redux";
import { filter } from "lodash";
import { createListResponseReducer, createTablePlaceholdersReducer } from "lib/redux/factories";
import { ActualRowManager } from "lib/tabling/managers";
import { ActionType } from "../actions";
import { initialActualsState } from "../initialState";

const listResponseReducer = createListResponseReducer<Model.Actual, Redux.Budget.ActualsStore>(
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
    SelectAll: ActionType.Actuals.SelectAll,
    Deleting: ActionType.Actuals.Deleting,
    Updating: ActionType.Actuals.Updating,
    Creating: ActionType.Actuals.Creating
  },
  {
    strictSelect: false,
    initialState: initialActualsState,
    subReducers: {
      placeholders: createTablePlaceholdersReducer(
        {
          AddToState: ActionType.Actuals.Placeholders.AddToState,
          RemoveFromState: ActionType.Actuals.Placeholders.RemoveFromState,
          UpdateInState: ActionType.Actuals.Placeholders.UpdateInState,
          Clear: ActionType.Actuals.Request
        },
        ActualRowManager
      )
    }
  }
);

const rootReducer: Reducer<Redux.Budget.ActualsStore, Redux.Action<any>> = (
  state: Redux.Budget.ActualsStore = initialActualsState,
  action: Redux.Action<any>
): Redux.Budget.ActualsStore => {
  let newState = { ...state };

  newState = listResponseReducer(newState, action);

  if (action.type === ActionType.Actuals.Placeholders.Activate) {
    const payload: Table.ActivatePlaceholderPayload<Model.Actual> = action.payload;
    newState = {
      ...newState,
      placeholders: filter(
        newState.placeholders,
        (placeholder: Table.ActualRow) => placeholder.id !== action.payload.id
      ),
      data: [...newState.data, payload.model]
    };
  }
  return newState;
};

export default rootReducer;
