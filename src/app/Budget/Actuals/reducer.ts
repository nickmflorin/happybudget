import { Reducer } from "redux";
import { createSimpleBooleanReducer, createModelListActionReducer, createListResponseReducer } from "store/factories";
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
    SelectAll: ActionType.Actuals.SelectAll
  },
  {
    referenceEntity: "actual",
    strictSelect: false,
    initialState: initialActualsState,
    keyReducers: {
      placeholders: createTablePlaceholdersReducer(
        {
          AddToState: ActionType.Actuals.Placeholders.AddToState,
          Activate: ActionType.Actuals.Placeholders.Activate,
          RemoveFromState: ActionType.Actuals.Placeholders.RemoveFromState,
          UpdateInState: ActionType.Actuals.Placeholders.UpdateInState,
          Clear: ActionType.Actuals.Request
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
);

const rootReducer: Reducer<Redux.Budget.IActualsStore, Redux.IAction<any>> = (
  state: Redux.Budget.IActualsStore = initialActualsState,
  action: Redux.IAction<any>
): Redux.Budget.IActualsStore => {
  let newState = { ...state };

  newState = listResponseReducer(newState, action);
  return newState;
};

export default rootReducer;
