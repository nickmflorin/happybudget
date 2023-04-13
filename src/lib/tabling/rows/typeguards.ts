import { isObjectOfType } from "../../schemas";

import * as schemas from "./schemas";
import * as types from "./types";

export const isRow = (obj: unknown): obj is types.Row => isObjectOfType(obj, schemas.RowSchema);

export const isPlaceholderRow = (row: unknown): row is types.RowOfType<"placeholder"> =>
  (row as types.RowOfType<"placeholder">).rowType === "placeholder";

export const isGroupRow = (row: unknown): row is types.RowOfType<"group"> =>
  isObjectOfType(row, schemas.GroupRowSchema);

export const isPageRow = (row: unknown): row is types.RowOfType<"page"> =>
  isObjectOfType(row, schemas.PageRowSchema);

export const isFooterRow = (row: unknown): row is types.RowOfType<"footer"> =>
  isObjectOfType(row, schemas.FooterRowSchema);

export const isModelRow = (row: unknown): row is types.RowOfType<"model"> =>
  isObjectOfType(row, schemas.ModelRowSchema);

export const isMarkupRow = (row: unknown): row is types.RowOfType<"markup"> =>
  isObjectOfType(row, schemas.MarkupRowSchema);

type IsRowOfTypeGuard<T extends types.RowType> = {
  (row: types.Row): row is types.RowOfType<T>;
};

type RowTypeGuards = { [key in types.RowType]: IsRowOfTypeGuard<key> };

const rowTypeGuards: RowTypeGuards = {
  footer: isFooterRow,
  page: isPageRow,
  model: isModelRow,
  group: isGroupRow,
  placeholder: isPlaceholderRow,
  markup: isMarkupRow,
};

export const isRowOfType = <T extends types.RowType, D extends types.RowData>(
  obj: unknown,
  rowType: T,
): obj is types.RowOfType<T, D> => isRow(obj) && rowTypeGuards[rowType](obj);

export const isBodyRow = (row: unknown): row is types.RowOfType<types.BodyRowType> =>
  isMarkupRow(row) || isModelRow(row) || isGroupRow(row) || isPlaceholderRow(row);

export const isDataRow = (row: unknown): row is types.RowOfType<types.DataRowType> =>
  isModelRow(row) || isPlaceholderRow(row);

export const isEditableRow = (row: unknown): row is types.RowOfType<types.EditableRowType> =>
  isModelRow(row) || isMarkupRow(row);

export const isRowWithIdentifier = <D extends types.RowData>(
  r: types.Row<D> | types.RowWithIdentifier<D>,
): r is types.RowWithIdentifier<D> =>
  (isMarkupRow(r) || isModelRow(r)) &&
  (r as types.RowWithIdentifier<D>).data.identifier !== undefined;

export const isRowWithColor = <D extends types.RowData>(
  r: types.Row<D> | types.RowWithIdentifier<D>,
): r is types.RowWithIdentifier<D> =>
  isModelRow(r) && (r as types.RowWithColor<D>).data.color !== undefined;

export const isRowWithName = <D extends types.RowData>(
  r: types.Row<D> | types.RowWithName<D>,
): r is types.RowWithName<D> =>
  isModelRow(r) && (r as types.RowWithName<D>).data.name !== undefined;

export const isPlaceholderRowId = (id: unknown): id is types.PlaceholderRowId =>
  isObjectOfType(id, schemas.PlaceholderRowIdSchema);

export const isGroupRowId = (id: unknown): id is types.GroupRowId =>
  isObjectOfType(id, schemas.GroupRowIdSchema);

export const isPageRowId = (id: unknown): id is types.FooterRowId<"page"> =>
  isObjectOfType(id, schemas.PageRowIdSchema);

export const isFooterRowId = (id: unknown): id is types.FooterRowId<"footer"> =>
  isObjectOfType(id, schemas.FooterRowIdSchema);

export const isModelRowId = (id: unknown): id is types.ModelRowId =>
  isObjectOfType(id, schemas.ModelRowIdSchema);

export const isMarkupRowId = (id: unknown): id is types.MarkupRowId =>
  isObjectOfType(id, schemas.MarkupRowIdSchema);

export const isBodyRowId = (
  id: unknown,
): id is types.ModelRowId | types.MarkupRowId | types.PlaceholderRowId | types.GroupRowId =>
  isMarkupRowId(id) || isModelRowId(id) || isGroupRowId(id) || isPlaceholderRowId(id);

export const isDataRowId = (id: unknown): id is types.ModelRowId | types.PlaceholderRowId =>
  isModelRowId(id) || isPlaceholderRowId(id);

export const isEditableRowId = (id: unknown): id is types.ModelRowId | types.PlaceholderRowId =>
  isModelRowId(id) || isMarkupRowId(id);
