import { Reducer } from "redux";
import { filter } from "lodash";
import { createListResponseReducer, createTablePlaceholdersReducer } from "lib/redux/factories";
import { ActualMapping } from "lib/tabling/mappings";
import { ActionType } from "../actions";
import { initialFringesState } from "../initialState";

const listResponseReducer = createListResponseReducer<IFringe, Redux.Budget.IFringesStore>(
  {
    Response: ActionType.Budget.Fringes.Response,
    Loading: ActionType.Budget.Fringes.Loading,
    SetSearch: ActionType.Budget.Fringes.SetSearch,
    UpdateInState: ActionType.Budget.Fringes.UpdateInState,
    RemoveFromState: ActionType.Budget.Fringes.RemoveFromState,
    AddToState: ActionType.Budget.Fringes.AddToState,
    Select: ActionType.Budget.Fringes.Select,
    Deselect: ActionType.Budget.Fringes.Deselect,
    SelectAll: ActionType.Budget.Fringes.SelectAll,
    Deleting: ActionType.Budget.Fringes.Deleting,
    Updating: ActionType.Budget.Fringes.Updating,
    Creating: ActionType.Budget.Fringes.Creating
  },
  {
    references: { entity: "fringe" },
    strictSelect: false,
    initialState: initialFringesState,
    subReducers: {
      placeholders: createTablePlaceholdersReducer(
        {
          AddToState: ActionType.Budget.Fringes.Placeholders.AddToState,
          RemoveFromState: ActionType.Budget.Fringes.Placeholders.RemoveFromState,
          UpdateInState: ActionType.Budget.Fringes.Placeholders.UpdateInState,
          Clear: ActionType.Budget.Fringes.Placeholders.Clear
        },
        ActualMapping,
        { references: { entity: "fringe" } }
      )
    }
  }
);

const rootReducer: Reducer<Redux.Budget.IFringesStore, Redux.IAction<any>> = (
  state: Redux.Budget.IFringesStore = initialFringesState,
  action: Redux.IAction<any>
): Redux.Budget.IFringesStore => {
  let newState = { ...state };

  newState = listResponseReducer(newState, action);

  if (action.type === ActionType.Budget.Fringes.Placeholders.Activate) {
    const payload: Table.ActivatePlaceholderPayload<IFringe> = action.payload;
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

export default rootReducer;
