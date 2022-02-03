import { SyntheticEvent } from "react";
import { isNil } from "lodash";

export const isRow = <R extends Table.RowData, M>(obj: Table.Row<R> | M): obj is Table.Row<R> =>
  typeof obj === "object" && (obj as Table.Row<R>).rowType !== undefined;

export const isPlaceholderRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.PlaceholderRow<R> =>
  (row as Table.PlaceholderRow<R>).rowType === "placeholder";

export const isPlaceholderRowId = (id: Table.RowId): id is Table.PlaceholderRowId =>
  typeof id === "string" && id.startsWith("placeholder-");

export const isGroupRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.GroupRow<R> =>
  (row as Table.GroupRow<R>).rowType === "group";

export const isGroupRowId = (id: Table.RowId): id is Table.GroupRowId =>
  typeof id === "string" && id.startsWith("group-");

export const isFooterRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.FooterRow =>
  (row as Table.FooterRow).rowType === "footer";

export const isFooterRowId = (id: Table.RowId): id is Table.FooterRowId =>
  typeof id === "string" && id.startsWith("footer-");

export const isBodyRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.BodyRow<R> => !isFooterRow(row);

export const isBodyRowId = (id: Table.RowId): id is Table.FooterRowId =>
  typeof id === "string" && !id.startsWith("footer-");

export const isRowWithIdentifier = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithIdentifier<R>
): r is Table.RowWithIdentifier<R> => {
  return isBodyRow(r) && (r as Table.RowWithIdentifier<R>).data.identifier !== undefined;
};

export const isMarkupRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.MarkupRow<R> =>
  (row as Table.MarkupRow<R>).rowType === "markup";

export const isMarkupRowId = (id: Table.RowId): id is Table.MarkupRowId =>
  typeof id === "string" && id.startsWith("markup-");

export const isModelRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.ModelRow<R> =>
  (row as Table.ModelRow<R>).rowType === "model";

export const isModelRowId = (id: Table.RowId): id is Table.ModelRowId => typeof id === "number";

export const isDataRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.DataRow<R> =>
  isPlaceholderRow(row) || isModelRow(row);

export const isDataRowId = (id: Table.RowId): id is Table.DataRowId => isModelRowId(id) || isPlaceholderRowId(id);

export const isEditableRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.EditableRow<R> =>
  (isModelRow(row) && row.gridId === "data") || isMarkupRow(row);

export const isRowWithColor = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithColor<R>
): r is Table.RowWithColor<R> => {
  return isModelRow(r) && (r as Table.RowWithColor<R>).data.color !== undefined;
};

export const isRowWithName = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithName<R>
): r is Table.RowWithName<R> => {
  return isModelRow(r) && (r as Table.RowWithName<R>).data.name !== undefined;
};

export const isRowWithDescription = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithDescription<R>
): r is Table.RowWithDescription<R> => {
  return isModelRow(r) && (r as Table.RowWithDescription<R>).data.description !== undefined;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isBodyColumn = <R extends Table.RowData, M extends Model.RowHttpModel, V extends Table.RawRowValue = any>(
  c: Table.Column<R, M, V>
): c is Table.BodyColumn<R, M, V> => (c as Table.BodyColumn<R, M, V>).cType === "body";

export const isCalculatedColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.CalculatedColumn<R, M> => (c as Table.CalculatedColumn<R, M>).cType === "calculated";

export const isActionColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.ActionColumn<R, M> => (c as Table.ActionColumn<R, M>).cType === "action";

export const isDataColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.DataColumn<R, M> => isBodyColumn(c) || isCalculatedColumn(c);

export const isFakeColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.FakeColumn<M> => (c as Table.FakeColumn<M>).cType === "fake";

export const isRealColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.RealColumn<R, M> => isDataColumn(c) || isActionColumn(c);

export const isModelColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.ModelColumn<R, M> => isDataColumn(c) || isFakeColumn(c);

export const isNonPlaceholderBodyRow = <R extends Table.RowData>(
  row: Table.Row<R>
): row is Table.NonPlaceholderBodyRow<R> => isEditableRow(row) || isGroupRow(row);

export const isAuthenticatedActionMap = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>,
  B extends Pick<Redux.AuthenticatedTableActionMap<R, M, C>, "tableChanged"> = Pick<
    Redux.AuthenticatedTableActionMap<R, M, C>,
    "tableChanged"
  >
>(
  a: A | B
): a is B => (a as B).tableChanged !== undefined;

export const isKeyboardEvent = (e: Table.CellDoneEditingEvent): e is KeyboardEvent => {
  return (e as KeyboardEvent).type === "keydown" && (e as KeyboardEvent).code !== undefined;
};

export const isSyntheticClickEvent = (e: Table.CellDoneEditingEvent): e is SyntheticEvent => {
  return (e as SyntheticEvent).type === "click";
};

export const isDataChangeEvent = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  e: Table.ChangeEvent<R, M, RW>
): e is Table.DataChangeEvent<R, RW> => {
  return (e as Table.DataChangeEvent<R, RW>).type === "dataChange";
};

export const isDataChangeEventAction = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
>(
  a: Redux.TableAction<Table.ChangeEvent<R, M>, C>
): a is Redux.TableAction<Table.DataChangeEvent<R>, C> => {
  return isDataChangeEvent(a.payload);
};

export const isModelUpdatedEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.ModelUpdatedEvent<M> => {
  return (e as Table.ModelUpdatedEvent<M>).type === "modelUpdated";
};

export const isModelAddedEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.ModelAddedEvent<M> => {
  return (e as Table.ModelAddedEvent<M>).type === "modelAdded";
};

export const isRowInsertEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowInsertEvent<R> => (e as Table.RowInsertEvent<R>).type === "rowInsert";

export const isRowAddEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowAddEvent<R> => (e as Table.RowAddEvent<R>).type === "rowAdd";

export const isRowAddIndexPayload = <R extends Table.RowData>(
  p: Table.RowAddPayload<R>
): p is Table.RowAddIndexPayload => typeof p === "object" && (p as Table.RowAddIndexPayload).newIndex !== undefined;

export const isRowAddCountPayload = <R extends Table.RowData>(
  p: Table.RowAddPayload<R>
): p is Table.RowAddCountPayload =>
  !isRowAddIndexPayload(p) && typeof p === "object" && (p as Table.RowAddCountPayload).count !== undefined;

export const isRowAddDataPayload = <R extends Table.RowData>(
  p: Table.RowAddPayload<R>
): p is Table.RowAddDataPayload<R> => !isRowAddIndexPayload(p) && !isRowAddCountPayload(p);

export const isRowAddDataEvent = <R extends Table.RowData>(
  e: Table.RowAddEvent<R>
): e is Table.RowAddEvent<R, Table.RowAddDataPayload<R>> => !isNil(e.payload) && isRowAddDataPayload(e.payload);

export const isRowAddDataEventAction = <R extends Table.RowData, C extends Table.Context = Table.Context>(
  a: Redux.TableAction<Table.RowAddEvent<R>, C>
): a is Redux.TableAction<Table.RowAddEvent<R, Table.RowAddDataPayload<R>>, C> => {
  return isRowAddDataEvent(a.payload);
};

export const isRowAddEventAction = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
>(
  a: Redux.TableAction<Table.ChangeEvent<R, M>, C>
): a is Redux.TableAction<Table.RowAddEvent<R>, C> => {
  return isRowAddEvent(a.payload);
};

export const isRowDeleteEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowDeleteEvent => (e as Table.RowDeleteEvent).type === "rowDelete";

export const isRowPositionChangedEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowPositionChangedEvent => (e as Table.RowPositionChangedEvent).type === "rowPositionChanged";

export const isRowRemoveFromGroupEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowRemoveFromGroupEvent => (e as Table.RowRemoveFromGroupEvent).type === "rowRemoveFromGroup";

export const isRowAddToGroupEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.RowAddToGroupEvent => (e as Table.RowAddToGroupEvent).type === "rowAddToGroup";

export const isGroupAddedEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.GroupAddedEvent => (e as Table.GroupAddedEvent).type === "groupAdded";

export const isFullRowEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.FullRowEvent => (e as Table.FullRowEvent).payload.rows !== undefined;

export const isGroupUpdateEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.GroupUpdatedEvent => (e as Table.GroupUpdatedEvent).type === "groupUpdated";

export const isGroupEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.GroupEvent =>
  isRowAddToGroupEvent(e) || isRowRemoveFromGroupEvent(e) || isGroupUpdateEvent(e) || isGroupAddedEvent(e);

export const isMarkupAddedEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.MarkupAddedEvent => (e as Table.MarkupAddedEvent).type === "markupAdded";

export const isMarkupUpdatedEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ChangeEvent<R, M>
): e is Table.MarkupUpdatedEvent => (e as Table.MarkupUpdatedEvent).type === "markupUpdated";
