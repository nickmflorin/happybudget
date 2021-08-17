import { redux } from "lib";
import ActionType from "./ActionType";

export * as budget from "./budget";
export * as template from "./template";

export { default as ActionType } from "./ActionType";

export const loadingFringeColorsAction = redux.actions.simpleAction<boolean>(ActionType.FringeColors.Loading);
export const responseFringeColorsAction = redux.actions.simpleAction<Http.ListResponse<string>>(
  ActionType.FringeColors.Response
);
