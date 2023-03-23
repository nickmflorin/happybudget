import { z } from "zod";

import * as types from "./types";

export const RowSchema = z.object({
  id: z.string(),
});

export const isRow = <R extends types.Row, TP extends types.RowType = types.RowType>(
  obj: unknown,
  rowType?: TP,
): obj is types.Row<TP> => {
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
  }
};

typeof obj === "object" && (obj as Table.Row<R>).rowType !== undefined;

export const isPlaceholderRow = <R extends Table.RowData>(
  row: Table.Row<R>,
): row is Table.PlaceholderRow<R> => (row as Table.PlaceholderRow<R>).rowType === "placeholder";

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

export const isBodyRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.BodyRow<R> =>
  !isFooterRow(row);

export const isBodyRowId = (id: Table.RowId): id is Table.FooterRowId =>
  typeof id === "string" && !id.startsWith("footer-");

export const isRowWithIdentifier = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithIdentifier<R>,
): r is Table.RowWithIdentifier<R> =>
  isBodyRow(r) && (r as Table.RowWithIdentifier<R>).data.identifier !== undefined;

export const isMarkupRow = <R extends Table.RowData>(
  row: Table.Row<R>,
): row is Table.MarkupRow<R> => (row as Table.MarkupRow<R>).rowType === "markup";

export const isMarkupRowId = (id: Table.RowId): id is Table.MarkupRowId =>
  typeof id === "string" && id.startsWith("markup-");

export const isModelRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.ModelRow<R> =>
  (row as Table.ModelRow<R>).rowType === "model";

export const isModelRowId = (id: Table.RowId): id is Table.ModelRowId => typeof id === "number";

export const isDataRow = <R extends Table.RowData>(row: Table.Row<R>): row is Table.DataRow<R> =>
  isPlaceholderRow(row) || isModelRow(row);

export const isDataRowId = (id: Table.RowId): id is Table.DataRowId =>
  isModelRowId(id) || isPlaceholderRowId(id);

export const isEditableRow = <R extends Table.RowData>(
  row: Table.Row<R>,
): row is Table.EditableRow<R> => (isModelRow(row) && row.gridId === "data") || isMarkupRow(row);

export const isRowWithColor = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithColor<R>,
): r is Table.RowWithColor<R> =>
  isModelRow(r) && (r as Table.RowWithColor<R>).data.color !== undefined;

export const isRowWithName = <R extends Table.RowData>(
  r: Table.Row<R> | Table.RowWithName<R>,
): r is Table.RowWithName<R> =>
  isModelRow(r) && (r as Table.RowWithName<R>).data.name !== undefined;
