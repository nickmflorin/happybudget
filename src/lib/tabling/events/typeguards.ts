import { SyntheticEvent } from "react";

import * as model from "../../model";
import { isObjectOfType } from "../../schemas";
import * as rows from "../rows";

import * as schemas from "./schemas";
import * as types from "./types";

export const isKeyboardEvent = (e: types.CellDoneEditingEvent): e is KeyboardEvent =>
  (e as KeyboardEvent).type === "keydown" && (e as KeyboardEvent).code !== undefined;

export const isSyntheticClickEvent = (e: types.CellDoneEditingEvent): e is SyntheticEvent =>
  (e as SyntheticEvent).type === "click";

export const isChangeEvent = <R extends rows.Row, M extends model.RowTypedApiModel>(
  e: types.AnyTableEvent<R, M>,
): e is types.AnyChangeEvent<R> => types.ChangeEventIds.contains(e.type);

export const isControlEvent = <R extends rows.Row, M extends model.RowTypedApiModel>(
  e: types.AnyTableEvent<R, M>,
): e is types.AnyControlEvent<R, M> => types.ControlEventIds.contains(e.type);

export const isMetaEvent = <R extends rows.Row, M extends model.RowTypedApiModel>(
  e: types.AnyTableEvent<R, M>,
): e is types.AnyMetaEvent => types.MetaEventIds.contains(e.type);

export const isTraversibleEvent = <R extends rows.Row, M extends model.RowTypedApiModel>(
  e: types.AnyTableEvent<R, M>,
): e is types.AnyTraversibleEvent<R> => types.TraversibleEventIds.contains(e.type);

export const isTableEventOfType = <
  T extends types.TableEventId,
  R extends rows.Row,
  M extends model.RowTypedApiModel,
>(
  e: types.AnyTableEvent<R, M>,
  eventId: T,
): e is types.TableEvent<T, R, M> => e.type === eventId;

export const isRowAddEvent = <R extends rows.Row, M extends model.RowTypedApiModel>(
  e: types.AnyTableEvent<R, M>,
): e is types.RowAddEvent<R> =>
  isTableEventOfType(e, "rowAddData") ||
  isTableEventOfType(e, "rowAddCount") ||
  isTableEventOfType(e, "rowAddIndex");

export const isRowAddIndexPayload = (m: unknown): m is types.RowAddIndexPayload =>
  isObjectOfType(m, schemas.RowAddIndexPayloadSchema) !== false;

export const isRowAddCountPayload = (m: unknown): m is types.RowAddCountPayload =>
  isObjectOfType(m, schemas.RowAddCountPayloadSchema) !== false;

export const isRowAddDataPayload = (m: unknown): m is types.RowAddDataPayload =>
  isObjectOfType(m, schemas.RowAddDataPayloadSchema) !== false;
