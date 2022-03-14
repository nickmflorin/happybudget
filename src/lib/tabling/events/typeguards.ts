import { SyntheticEvent } from "react";
import { includes, isNil } from "lodash";

import * as constants from "./constants";

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
