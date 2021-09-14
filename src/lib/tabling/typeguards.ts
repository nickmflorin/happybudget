import { SyntheticEvent } from "react";

export const isPlaceholderRow = <R extends Table.RowData = any>(row: Table.Row<R>): row is Table.PlaceholderRow<R> =>
  (row as Table.PlaceholderRow<R>).rowType === "placeholder";

export const isGroupRow = <R extends Table.RowData = any>(row: Table.Row<R>): row is Table.GroupRow<R> =>
  (row as Table.GroupRow<R>).rowType === "group";

export const isModelRow = <R extends Table.RowData = any>(row: Table.Row<R>): row is Table.ModelRow<R> =>
  (row as Table.ModelRow<R>).rowType === "model";

export const isDataRow = <R extends Table.RowData = any>(row: Table.Row<R>): row is Table.DataRow<R> =>
  isPlaceholderRow(row) || isModelRow(row);

/* eslint-disable indent */
export const isAuthenticatedActionMap = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  a:
    | Redux.ActionMapObject<Redux.TableActionMap<M, G>>
    | Redux.ActionMapObject<Redux.AuthenticatedTableActionMap<R, M, G>>
): a is Redux.ActionMapObject<Redux.AuthenticatedTableActionMap<R, M, G>> =>
  (a as Redux.ActionMapObject<Redux.AuthenticatedTableActionMap<R, M, G>>).tableChanged !== undefined;

export const isRow = <M extends Model.Model>(obj: Table.Row<M> | M): obj is Table.Row<M> =>
  (obj as Table.Row<M>).data !== undefined;

export const isAgColumn = <R extends Table.RowData>(
  col: Table.Column<R, any, any> | PdfTable.Column<R, any, any>
): col is Table.Column<R, any, any> => (col as Table.Column<R, any, any>).domain === "aggrid";

export const isKeyboardEvent = (e: Table.CellDoneEditingEvent): e is KeyboardEvent => {
  return (e as KeyboardEvent).type === "keydown" && (e as KeyboardEvent).code !== undefined;
};

export const isSyntheticClickEvent = (e: Table.CellDoneEditingEvent): e is SyntheticEvent => {
  return (e as SyntheticEvent).type === "click";
};

export const isDataChangeEvent = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  e: Table.ChangeEvent<R, M>
): e is Table.DataChangeEvent<R, M> => {
  return (e as Table.DataChangeEvent<R, M>).type === "dataChange";
};

export const isRowAddEvent = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowAddEvent<R> => {
  return (e as Table.RowAddEvent<R>).type === "rowAdd";
};

export const isRowDeleteEvent = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowDeleteEvent<R, M> => {
  return (e as Table.RowDeleteEvent<R, M>).type === "rowDelete";
};

export const isRowRemoveFromGroupEvent = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowRemoveFromGroupEvent<R, M> => {
  return (e as Table.RowRemoveFromGroupEvent<R, M>).type === "rowRemoveFromGroup";
};

export const isRowAddToGroupEvent = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowAddToGroupEvent<R, M> => {
  return (e as Table.RowAddToGroupEvent<R, M>).type === "rowAddToGroup";
};

export const isGroupAddEvent = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  e: Table.ChangeEvent<R, M, G>
): e is Table.GroupAddEvent<G> => {
  return (e as Table.GroupAddEvent<G>).type === "groupAdd";
};

export const isFullRowEvent = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  e: Table.ChangeEvent<R, M>
): e is Table.FullRowEvent<R, M> => {
  return (e as Table.FullRowEvent<R, M>).payload.rows !== undefined;
};

export const isGroupEvent = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  e: Table.ChangeEvent<R, M, G>
): e is Table.GroupEvent<R, M, G> => {
  return isRowAddToGroupEvent(e) || isRowRemoveFromGroupEvent(e) || isGroupUpdateEvent(e) || isGroupAddEvent(e);
};

export const isGroupUpdateEvent = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  e: Table.ChangeEvent<R, M, G>
): e is Table.GroupUpdateEvent<G> => {
  return (e as Table.GroupUpdateEvent<G>).type === "groupUpdate";
};
