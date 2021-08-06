import { redux } from "lib";
import ActionType from "./ActionType";

export { default as ActionType } from "./ActionType";

export const loadingFringeColorsAction = redux.actions.simpleAction<boolean>(ActionType.FringeColors.Loading);
export const responseFringeColorsAction = redux.actions.simpleAction<Http.ListResponse<string>>(
  ActionType.FringeColors.Response
);
export const responseSubAccountUnitsAction = redux.actions.simpleAction<Http.ListResponse<Model.Tag>>(
  ActionType.SubAccountUnits.Response
);
export const loadingSubAccountUnitsAction = redux.actions.simpleAction<boolean>(ActionType.SubAccountUnits.Loading);
