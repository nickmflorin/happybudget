import { isNil, reduce, filter, orderBy } from "lodash";

export const orderActions = (actions: Table.MenuActionObj[]): Table.MenuActionObj[] => {
  const actionsWithIndex = filter(actions, (action: Table.MenuActionObj) => !isNil(action.index));
  const actionsWithoutIndex = filter(actions, (action: Table.MenuActionObj) => isNil(action.index));
  return [...orderBy(actionsWithIndex, ["index"], ["asc"]), ...actionsWithoutIndex];
};

/* eslint-disable indent */
export const evaluateActions = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  T extends Table.MenuActionParams<R, M, G> = Table.MenuActionParams<R, M, G>
>(
  actions: Table.MenuActions<R, M, G, T>,
  params: T
): Table.MenuActionObj[] => {
  return orderActions(
    reduce(
      Array.isArray(actions) ? actions : actions(params),
      (objs: Table.MenuActionObj[], action: Table.MenuAction<R, M, G, T>) => {
        return [...objs, typeof action === "function" ? action(params) : action];
      },
      []
    )
  );
};

export const combineMenuActions = <
  P extends Table.MenuActionParams<R, M, G>,
  R extends Table.RowData,
  M extends Model.Model,
  G extends Model.Group = Model.Group
>(
  ...args: Table.MenuActions<R, M, G, P>[]
): Table.MenuActions<R, M, G, P> => {
  return (params: P) =>
    reduce(
      args,
      (curr: Array<Table.MenuAction<R, M, G, P>>, actions: Table.MenuActions<R, M, G, P>) => {
        return [...curr, ...(typeof actions === "function" ? actions(params) : actions)];
      },
      []
    );
};
