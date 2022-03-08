import { SyntheticEvent } from "react";
import { includes, isNil } from "lodash";

import * as constants from "./constants";

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
): r is Table.RowWithIdentifier<R> => isBodyRow(r) && (r as Table.RowWithIdentifier<R>).data.identifier !== undefined;

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
): r is Table.RowWithColor<R> => isModelRow(r) && (r as Table.RowWithColor<R>).data.color !== undefined;

export const isRowWithName = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithName<R>
): r is Table.RowWithName<R> => isModelRow(r) && (r as Table.RowWithName<R>).data.name !== undefined;

export const isRowWithDescription = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithDescription<R>
): r is Table.RowWithDescription<R> =>
  isModelRow(r) && (r as Table.RowWithDescription<R>).data.description !== undefined;

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
  B extends Pick<Redux.AuthenticatedTableActionMap<R, M, C>, "handleEvent"> = Pick<
    Redux.AuthenticatedTableActionMap<R, M, C>,
    "handleEvent"
  >
>(
  a: A | B
): a is B => (a as B).handleEvent !== undefined;

export const isKeyboardEvent = (e: Table.CellDoneEditingEvent): e is KeyboardEvent =>
  (e as KeyboardEvent).type === "keydown" && (e as KeyboardEvent).code !== undefined;

export const isSyntheticClickEvent = (e: Table.CellDoneEditingEvent): e is SyntheticEvent =>
  (e as SyntheticEvent).type === "click";

export const isChangeEvent = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  e: Table.Event<R, M, RW>
): e is Table.ChangeEvent<R, RW> => includes(constants.CHANGE_EVENT_IDS, (e as Table.DataChangeEvent<R, RW>).type);

export const isControlEvent = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  e: Table.Event<R, M, RW>
): e is Table.ControlEvent<R, M> => includes(constants.CONTROL_EVENT_IDS, (e as Table.ControlEvent<R, M>).type);

export const isMetaEvent = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  e: Table.Event<R, M, RW>
): e is Table.MetaEvent => includes(constants.META_EVENT_IDS, (e as Table.MetaEvent).type);

export const isTraversibleEvent = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  e: Table.Event<R, M, RW>
): e is Table.TraversibleEvent<R, RW> =>
  includes(constants.TRAVERSIBLE_EVENT_IDS, (e as Table.TraversibleEvent<R, RW>).type);

export const isDataChangeEvent = <R extends Table.RowData, RW extends Table.EditableRow<R> = Table.EditableRow<R>>(
  e: Table.ChangeEvent<R, RW>
): e is Table.DataChangeEvent<R, RW> => (e as Table.DataChangeEvent<R, RW>).type === "dataChange";

export const isActionWithChangeEvent = <
  T extends Table.ChangeEventId,
  R extends Table.RowData = Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  RW extends Table.EditableRow<R> = Table.ModelRow<R>,
  C extends Table.Context = Table.Context
>(
  a: Redux.TableAction<Table.ChangeEvent<R, RW>, C>,
  t: T
): a is Redux.TableAction<Table.ChangeEventLookup<T, R, RW>, C> =>
  (a as Redux.TableAction<Table.EventLookup<T, R, M, RW>, C>).type === t;

export const isModelsUpdatedEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ControlEvent<R, M>
): e is Table.ModelsUpdatedEvent<M> => (e as Table.ModelsUpdatedEvent<M>).type === "modelsUpdated";

export const isPlaceholdersActivatedEvent = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(
  e: Table.ControlEvent<R, M>
): e is Table.PlaceholdersActivatedEvent<M> =>
  (e as Table.PlaceholdersActivatedEvent<M>).type === "placeholdersActivated";

export const isUpdateRowsEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ControlEvent<R, M>
): e is Table.UpdateRowsEvent<R> => (e as Table.UpdateRowsEvent<R>).type === "updateRows";

export const isModelsAddedEvent = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  e: Table.ControlEvent<R, M>
): e is Table.ModelsAddedEvent<M> => (e as Table.ModelsAddedEvent<M>).type === "modelsAdded";

export const isRowInsertEvent = <R extends Table.RowData>(e: Table.ChangeEvent<R>): e is Table.RowInsertEvent<R> =>
  (e as Table.RowInsertEvent<R>).type === "rowInsert";

export const isRowAddEvent = <R extends Table.RowData, P extends Table.RowAddPayload<R> = Table.RowAddPayload<R>>(
  e: Table.ChangeEvent<R>
): e is Table.RowAddEvent<R, P> => (e as Table.RowAddEvent<R, P>).type === "rowAdd";

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
): a is Redux.TableAction<Table.RowAddEvent<R, Table.RowAddDataPayload<R>>, C> => isRowAddDataEvent(a.payload);

export const isRowAddEventAction = <R extends Table.RowData, C extends Table.Context = Table.Context>(
  a: Redux.TableAction<Table.ChangeEvent<R>, C>
): a is Redux.TableAction<Table.RowAddEvent<R>, C> => isRowAddEvent(a.payload);

export const isRowDeleteEvent = <R extends Table.RowData>(e: Table.ChangeEvent<R>): e is Table.RowDeleteEvent =>
  (e as Table.RowDeleteEvent).type === "rowDelete";

export const isRowPositionChangedEvent = <R extends Table.RowData>(
  e: Table.ChangeEvent<R>
): e is Table.RowPositionChangedEvent => (e as Table.RowPositionChangedEvent).type === "rowPositionChanged";

export const isRowRemoveFromGroupEvent = <R extends Table.RowData>(
  e: Table.ChangeEvent<R>
): e is Table.RowRemoveFromGroupEvent => (e as Table.RowRemoveFromGroupEvent).type === "rowRemoveFromGroup";

export const isRowAddToGroupEvent = <R extends Table.RowData>(e: Table.ChangeEvent<R>): e is Table.RowAddToGroupEvent =>
  (e as Table.RowAddToGroupEvent).type === "rowAddToGroup";

export const isFullRowEvent = <R extends Table.RowData>(e: Table.ChangeEvent<R>): e is Table.FullRowEvent =>
  (e as Table.FullRowEvent).payload.rows !== undefined;

export const isGroupChangeEvent = <R extends Table.RowData>(e: Table.ChangeEvent<R>): e is Table.GroupChangeEvent =>
  isRowAddToGroupEvent(e) || isRowRemoveFromGroupEvent(e);
