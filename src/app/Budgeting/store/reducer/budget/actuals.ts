import { Reducer } from "redux";

import { createModelListResponseReducer } from "lib/redux/factories";
import { initialModelListResponseState } from "store/initialState";
import { ActionType } from "../../actions";

const listResponseReducer = createModelListResponseReducer<Model.Actual, Redux.ModelListResponseStore<Model.Actual>>(
  {
    Response: ActionType.Budget.Actuals.Response,
    Request: ActionType.Budget.Actuals.Request,
    Loading: ActionType.Budget.Actuals.Loading,
    SetSearch: ActionType.Budget.Actuals.SetSearch,
    UpdateInState: ActionType.Budget.Actuals.UpdateInState,
    RemoveFromState: ActionType.Budget.Actuals.RemoveFromState,
    AddToState: ActionType.Budget.Actuals.AddToState,
    Select: ActionType.Budget.Actuals.Select,
    Deselect: ActionType.Budget.Actuals.Deselect,
    SelectAll: ActionType.Budget.Actuals.SelectAll,
    Deleting: ActionType.Budget.Actuals.Deleting,
    Updating: ActionType.Budget.Actuals.Updating,
    Creating: ActionType.Budget.Actuals.Creating
  },
  {
    strictSelect: false,
    initialState: initialModelListResponseState
  }
);

const rootReducer: Reducer<Redux.ModelListResponseStore<Model.Actual>, Redux.Action<any>> = (
  state: Redux.ModelListResponseStore<Model.Actual> = initialModelListResponseState,
  action: Redux.Action<any>
): Redux.ModelListResponseStore<Model.Actual> => {
  return listResponseReducer(state, action);
};

export default rootReducer;
