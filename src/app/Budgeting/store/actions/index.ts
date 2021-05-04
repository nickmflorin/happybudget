import { simpleAction } from "store/actions";
import ActionType from "./ActionType";

export { default as ActionType } from "./ActionType";

export const loadingFringeColorsAction = simpleAction<boolean>(ActionType.FringeColors.Loading);
export const responseFringeColorsAction = simpleAction<Http.ListResponse<string>>(ActionType.FringeColors.Response);
