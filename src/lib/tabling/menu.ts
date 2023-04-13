import { orderBy } from "lodash";

import * as model from "../model";

import * as rows from "./rows";
import * as types from "./types";

export const orderActions = (actions: types.MenuActionObj[]): types.MenuActionObj[] => {
  const actionsWithIndex = actions.filter(
    (action: types.MenuActionObj) => action.index !== undefined,
  );
  const actionsWithoutIndex = actions.filter(
    (action: types.MenuActionObj) => action.index === undefined,
  );
  return [...orderBy(actionsWithIndex, ["index"], ["asc"]), ...actionsWithoutIndex];
};

export const evaluateActions = <
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  T extends types.PublicMenuActionParams<R, M> = types.PublicMenuActionParams<R, M>,
>(
  actions: types.MenuActions<R, M, T>,
  params: T,
): types.MenuActionObj[] =>
  orderActions(
    (Array.isArray(actions) ? actions : actions(params)).reduce(
      (objs: types.MenuActionObj[], action: types.MenuAction<R, M, T>) => [
        ...objs,
        typeof action === "function" ? action(params) : action,
      ],
      [],
    ),
  );

export const combineMenuActions =
  <
    P extends types.PublicMenuActionParams<R, M>,
    R extends rows.Row,
    M extends model.RowTypedApiModel,
  >(
    ...args: types.MenuActions<R, M, P>[]
  ): types.MenuActions<R, M, P> =>
  (params: P) =>
    args.reduce(
      (curr: Array<types.MenuAction<R, M, P>>, actions: types.MenuActions<R, M, P>) => [
        ...curr,
        ...(typeof actions === "function" ? actions(params) : actions),
      ],
      [],
    );
