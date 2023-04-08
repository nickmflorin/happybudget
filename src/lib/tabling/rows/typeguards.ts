import { isObjectOfType } from "../../schemas";

import * as schemas from "./schemas";
import * as types from "./types";

export const isRow = (obj: unknown): obj is types.Row => isObjectOfType(obj, schemas.RowSchema);

export const isPlaceholderRow = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<"placeholder", D> =>
  (row as types.RowOfType<"placeholder", D>).rowType === "placeholder";

export const isGroupRow = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<"group", D> => isObjectOfType(row, schemas.GroupRowSchema);

export const isPageRow = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<"page", D> => isObjectOfType(row, schemas.PageRowSchema);

export const isFooterRow: IsRowOfTypeGuard<"footer"> = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<"footer", D> => isObjectOfType(row, schemas.FooterRowSchema);

export const isModelRow = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<"model", D> => isObjectOfType(row, schemas.ModelRowSchema);

export const isMarkupRow = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<"markup", D> => isObjectOfType(row, schemas.MarkupRowSchema);

type IsRowOfTypeGuard<T extends types.RowType> = {
  <D extends types.RowData = types.RowData>(row: types.Row<D>): row is types.RowOfType<T, D>;
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

export const isBodyRow = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<types.BodyRowType, D> =>
  isMarkupRow(row) || isModelRow(row) || isGroupRow(row) || isPlaceholderRow(row);

export const isDataRow = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<types.DataRowType, D> => isModelRow(row) || isPlaceholderRow(row);

export const isEditableRow = <D extends types.RowData>(
  row: types.Row<D>,
): row is types.RowOfType<types.EditableRowType, D> => isModelRow(row) || isMarkupRow(row);

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

export const isPlaceholderRowId = (id: types.RowId): id is types.PlaceholderRowId =>
  isObjectOfType(id, schemas.PlaceholderRowIdSchema);

export const isGroupRowId = (id: types.RowId): id is types.GroupRowId =>
  isObjectOfType(id, schemas.GroupRowIdSchema);

export const isPageRowId = (id: types.RowId): id is types.FooterRowId<"page"> =>
  isObjectOfType(id, schemas.PageRowIdSchema);

export const isFooterRowId = (id: types.RowId): id is types.FooterRowId<"footer"> =>
  isObjectOfType(id, schemas.FooterRowIdSchema);

export const isModelRowId = (id: types.RowId): id is types.ModelRowId =>
  isObjectOfType(id, schemas.ModelRowIdSchema);

export const isMarkupRowId = (id: types.RowId): id is types.MarkupRowId =>
  isObjectOfType(id, schemas.MarkupRowIdSchema);

export const isBodyRowId = (
  id: types.RowId,
): id is types.ModelRowId | types.MarkupRowId | types.PlaceholderRowId | types.GroupRowId =>
  isMarkupRowId(id) || isModelRowId(id) || isGroupRowId(id) || isPlaceholderRowId(id);

export const isDataRowId = (id: types.RowId): id is types.ModelRowId | types.PlaceholderRowId =>
  isModelRowId(id) || isPlaceholderRowId(id);

export const isEditableRowId = (id: types.RowId): id is types.ModelRowId | types.PlaceholderRowId =>
  isModelRowId(id) || isMarkupRowId(id);
