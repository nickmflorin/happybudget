import { Reducer } from "redux";

import { createModelListResponseReducer } from "lib/redux/factories";
import { initialModelListResponseState } from "store/initialState";
import { ActionType } from "../actions";

const createRootReducer = <D extends Redux.Budgeting.BudgetDirective>(
  /* eslint-disable indent */
  directive: D
): Reducer<Redux.ModelListResponseStore<Model.Fringe>, Redux.Action<any>> => {
  const listResponseReducer = createModelListResponseReducer<Model.Fringe, Redux.ModelListResponseStore<Model.Fringe>>(
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
      initialState: initialModelListResponseState
    }
  );
  return (
    state: Redux.ModelListResponseStore<Model.Fringe> = initialModelListResponseState,
    action: Redux.Action<any>
  ): Redux.ModelListResponseStore<Model.Fringe> => {
    return listResponseReducer(state, action);
  };
};

export default createRootReducer;
