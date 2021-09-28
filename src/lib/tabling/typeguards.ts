import { SyntheticEvent } from "react";

export const isPlaceholderRow = <R extends Table.RowData = object>(row: Table.Row<R>): row is Table.PlaceholderRow<R> =>
  (row as Table.PlaceholderRow<R>).rowType === "placeholder";

export const isPlaceholderRowId = (id: Table.RowId): id is Table.PlaceholderRowId =>
  typeof id === "string" && id.startsWith("placeholder-");

export const isGroupRow = <R extends Table.RowData = object>(row: Table.Row<R>): row is Table.GroupRow<R> =>
  (row as Table.GroupRow<R>).rowType === "group";

export const isGroupRowId = (id: Table.RowId): id is Table.GroupRowId =>
  typeof id === "string" && id.startsWith("group-");

export const isMarkupRow = <R extends Table.RowData = object>(row: Table.Row<R>): row is Table.MarkupRow<R> =>
  (row as Table.MarkupRow<R>).rowType === "markup";

export const isMarkupRowId = (id: Table.RowId): id is Table.MarkupRowId =>
  typeof id === "string" && id.startsWith("markup-");

export const isModelRow = <R extends Table.RowData = object>(row: Table.Row<R>): row is Table.ModelRow<R> =>
  (row as Table.ModelRow<R>).rowType === "model";

export const isModelRowId = (id: Table.RowId): id is Table.ModelRowId => typeof id === "number";

export const isDataRow = <R extends Table.RowData = object, M extends Model.HttpModel = any>(
  row: Table.Row<R, M>
): row is Table.DataRow<R, M> => isPlaceholderRow(row) || isModelRow(row);

export const isDataRowId = (id: Table.RowId): id is Table.DataRowId => isModelRowId(id) || isPlaceholderRowId(id);

export const isEditableRow = <R extends Table.RowData = object>(row: Table.Row<R>): row is Table.DataRow<R> =>
  isPlaceholderRow(row) || isModelRow(row) || isMarkupRow(row);

export const isEditableNonDataRow = <R extends Table.RowData = object>(
  row: Table.Row<R>
): row is Table.EditableNonDataRow<R> => isEditableRow(row) && !isDataRow(row);

export const isGroupableRow = <R extends Table.RowData = object>(row: Table.Row<R>): row is Table.GroupableRow<R> =>
  isModelRow(row) || isMarkupRow(row);

export const isMarkupableRow = <R extends Table.RowData = object>(row: Table.Row<R>): row is Table.MarkupableRow<R> =>
  isModelRow(row) || isGroupRow(row);

/* eslint-disable indent */
export const isAuthenticatedActionMap = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  a: Redux.ActionMapObject<Redux.TableActionMap<M>> | Redux.ActionMapObject<Redux.AuthenticatedTableActionMap<R, M>>
): a is Redux.ActionMapObject<Redux.AuthenticatedTableActionMap<R, M>> =>
  (a as Redux.ActionMapObject<Redux.AuthenticatedTableActionMap<R, M>>).tableChanged !== undefined;

export const isRow = <R extends Table.RowData, M extends Model.HttpModel>(
  obj: Table.Row<R, M> | M
): obj is Table.Row<R, M> => (obj as Table.Row<R, M>).data !== undefined;

export const isAgColumn = <R extends Table.RowData>(
  col: Table.Column<R, any, any> | PdfTable.Column<R, any>
): col is Table.Column<R, any, any> => (col as Table.Column<R, any, any>).domain === "aggrid";

export const isKeyboardEvent = (e: Table.CellDoneEditingEvent): e is KeyboardEvent => {
  return (e as KeyboardEvent).type === "keydown" && (e as KeyboardEvent).code !== undefined;
};

export const isSyntheticClickEvent = (e: Table.CellDoneEditingEvent): e is SyntheticEvent => {
  return (e as SyntheticEvent).type === "click";
};

export const isDataChangeEvent = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  e: Table.ChangeEvent<R, M>
): e is Table.DataChangeEvent<R, M, RW> => {
  return (e as Table.DataChangeEvent<R, M, RW>).type === "dataChange";
};

export const isRowAddEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowAddEvent<R> => {
  return (e as Table.RowAddEvent<R>).type === "rowAdd";
};

export const isRowDeleteEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowDeleteEvent => {
  return (e as Table.RowDeleteEvent).type === "rowDelete";
};

export const isRowRemoveFromGroupEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowRemoveFromGroupEvent => {
  return (e as Table.RowRemoveFromGroupEvent).type === "rowRemoveFromGroup";
};

export const isRowAddToGroupEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowAddToGroupEvent => {
  return (e as Table.RowAddToGroupEvent).type === "rowAddToGroup";
};

export const isGroupAddEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.GroupAddEvent => {
  return (e as Table.GroupAddEvent).type === "groupAdd";
};

export const isFullRowEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.FullRowEvent => {
  return (e as Table.FullRowEvent).payload.rows !== undefined;
};

export const isGroupEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.GroupEvent => {
  return isRowAddToGroupEvent(e) || isRowRemoveFromGroupEvent(e) || isGroupUpdateEvent(e) || isGroupAddEvent(e);
};

export const isGroupUpdateEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.GroupUpdateEvent => {
  return (e as Table.GroupUpdateEvent).type === "groupUpdate";
};

export const isMarkupAddEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.MarkupAddEvent => {
  return (e as Table.MarkupAddEvent).type === "markupAdd";
};

export const isMarkupUpdateEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.MarkupUpdateEvent => {
  return (e as Table.MarkupUpdateEvent).type === "markupUpdate";
};

export const isRowRemoveFromMarkupEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowRemoveFromMarkupEvent => {
  return (e as Table.RowRemoveFromMarkupEvent).type === "rowRemoveFromMarkup";
};

export const isRowAddToMarkupEvent = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowAddToMarkupEvent => {
  return (e as Table.RowAddToMarkupEvent).type === "rowAddToMarkup";
};
