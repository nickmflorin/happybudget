import { Reducer } from "redux";
import { filter } from "lodash";
import { createListResponseReducer } from "store/factories";
import { ActualMapping } from "model/tableMappings";
import { ActionType } from "../actions";
import { createTablePlaceholdersReducer } from "../factories";
import { initialActualsState } from "../initialState";

const listResponseReducer = createListResponseReducer<IActual, Redux.Budget.IActualsStore>(
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
    referenceEntity: "actual",
    strictSelect: false,
    initialState: initialActualsState,
    keyReducers: {
      placeholders: createTablePlaceholdersReducer(
        {
          AddToState: ActionType.Actuals.Placeholders.AddToState,
          RemoveFromState: ActionType.Actuals.Placeholders.RemoveFromState,
          UpdateInState: ActionType.Actuals.Placeholders.UpdateInState,
          Clear: ActionType.Actuals.Request
        },
        ActualMapping,
        { referenceEntity: "actual" }
      )
    }
  }
);

const rootReducer: Reducer<Redux.Budget.IActualsStore, Redux.IAction<any>> = (
  state: Redux.Budget.IActualsStore = initialActualsState,
  action: Redux.IAction<any>
): Redux.Budget.IActualsStore => {
  let newState = { ...state };

  newState = listResponseReducer(newState, action);

  if (action.type === ActionType.Actuals.Placeholders.Activate) {
    const payload: Table.ActivatePlaceholderPayload<IActual> = action.payload;
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
