import { RowClassParams } from "ag-grid-community";

import * as model from "../../model";
import * as ui from "../../ui";
import { enumeratedLiterals, EnumeratedLiteralType } from "../../util/literals";
import { EnumeratedLiteralType } from "../../util/types/literals";
import * as columns from "../columns";
import { CellValue, FooterGridId, TableClassName } from "../types";

export type EditRowActionBehavior = "expand" | "edit";

export type GetRowStyle<R extends RowOfType<BodyRowType> = RowOfType<BodyRowType>> = (
  params: RowClassParams<R>,
) => ui.Style | null | undefined;

export type RowClassName<R extends RowOfType<BodyRowType> = RowOfType<BodyRowType>> =
  TableClassName<RowClassParams<R>>;

export type GetRowClassName<R extends RowOfType<BodyRowType> = RowOfType<BodyRowType>> = (
  params: RowClassParams<R>,
) => RowClassName<R>;

export interface RowColorDef {
  readonly backgroundColor?: ui.HexColor;
  readonly color?: ui.HexColor;
}

export const DataRowTypes = enumeratedLiterals(["placeholder", "model"] as const);
export type DataRowType = EnumeratedLiteralType<typeof DataRowTypes>;

export const BodyRowTypes = enumeratedLiterals([
  ...DataRowTypes.__ALL__,
  "markup",
  "group",
] as const);
export type BodyRowType = EnumeratedLiteralType<typeof BodyRowTypes>;

export const RowTypes = enumeratedLiterals([...BodyRowTypes.__ALL__, "page", "footer"] as const);
export type RowType = EnumeratedLiteralType<typeof RowTypes>;

export const EditableRowTypes = enumeratedLiterals([RowTypes.MARKUP, RowTypes.MODEL] as const);
export type EditableRowType = EnumeratedLiteralType<typeof EditableRowTypes>;

export const ExpandedRowTypes = enumeratedLiterals(["body", "data", "editable"] as const);
export type ExpandedRowType = EnumeratedLiteralType<typeof ExpandedRowTypes>;

export type ExpandableRowTypeToRowType<T extends ExpandedRowType> = {
  body: BodyRowType;
  data: DataRowType;
  editable: EditableRowType;
}[T];

export type ModelRowId = number;
export type FooterRowId<T extends FooterGridId> = `footer-${T}`;
export type PlaceholderRowId = `placeholder-${number}`;
export type GroupRowId = `group-${number}`;
export type MarkupRowId = `markup-${number}`;

export type NonPlaceholderBodyRowId = RowId<EditableRowType | "group">;

export type RowId<T extends RowType> = {
  markup: MarkupRowId;
  group: GroupRowId;
  placeholder: PlaceholderRowId;
  model: ModelRowId;
  footer: FooterRowId<"footer">;
  page: FooterRowId<"page">;
}[T];

export type AnyRowId = RowId<RowType>;

export type RowGridId<T extends RowType> = {
  markup: "data";
  group: "data";
  placeholder: "data";
  model: "data";
  footer: "footer";
  page: "page";
}[T];

/**
 * The base representation of a {@link Row} in the application that rows of all types extend.
 *
 * @type {BaseRow}
 *
 * @param {RowType} T The row type classification of the row.
 *
 * @param {RowData} D
 *   The row data associated with the row. This is the same for rows of all row types that form the
 *   union of {@link Row<D>}.
 *
 *   Note: While many row type classifications are not associated with a 'data' field, the row data
 *   {@link RowData} defined by {@link D} is stored as a private member field, '__dataType__' on all
 *   row type classifications.  This allows each row type classification of {@link Row<D>} to have a
 *   reference to the data type, {@link D}.
 *
 * @member {RowId<T>} id
 *   The ID of the row.  The form of this parameter depends on the type of the row.
 *
 * @member {RowGridId<T>} gridId
 *   The ID of the grid that the row is associated with.  The form of this parameter depends on the
 *   type of the row.
 *
 * @member {T} rowType The type classification of the row.
 */
export type BaseRow<
  T extends RowType = RowType,
  D extends RowData = RowData,
  I extends RowId<T> = RowId<T>,
> = {
  readonly id: I;
  readonly gridId: RowGridId<T>;
  readonly rowType: T;
  readonly __dataType__: D;
};

export type ModelRow<D extends RowData = RowData> = BaseRow<"model", D> & {
  readonly children: number[];
  readonly order: string;
  // This field is primarily used for logging purposes.
  readonly modelType: model.RowHttpModelType;
  readonly data: D;
};

export type MarkupRow<D extends RowData = RowData> = BaseRow<"markup", D> & {
  readonly children: number[];
  readonly data: model.Markup;
};

export type GroupRow<D extends RowData = RowData> = BaseRow<"group", D> & {
  readonly children: number[];
  readonly data: model.Group;
};

export type PlaceholderRow<D extends RowData = RowData> = BaseRow<"placeholder", D> & {
  readonly children: number[];
  readonly data: D;
};

export type FooterRow<D extends RowData = RowData> = BaseRow<"footer", D>;
export type PageRow<D extends RowData = RowData> = BaseRow<"page", D>;

export type RowData<N extends string = string, T = unknown> = { [key in N]: T };

export type GetRowData<R extends Row, N extends string = string, T = unknown> = R extends {
  __dataType__: infer D extends RowData<N, T>;
}
  ? D
  : never;

export type _Row<T extends RowType = RowType, D extends RowData = RowData> = {
  model: ModelRow<D>;
  markup: MarkupRow<D>;
  group: GroupRow<D>;
  placeholder: PlaceholderRow<D>;
  footer: FooterRow<D>;
  page: PageRow<D>;
}[T];

export type Row<D extends RowData = RowData> = _Row<RowType, D>;

export type RowOfType<T extends RowType, D extends RowData = RowData> = _Row<T, D>;

export type RowSubType<
  R extends Row,
  TP extends RowType,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = R & RowOfType<TP, GetRowData<R, N, T>>;

export type RowNameLabelType = number | string | null;

export type RowStringGetter<R extends Row> = RowNameLabelType | ((row: R) => RowNameLabelType);

export type RowWithColor<D extends RowData> = RowOfType<"model", D & { color: ui.HexColor | null }>;

export type RowWithName<D extends RowData> = RowOfType<"model", D & { name: string | null }>;

export type RowWithDescription<D extends RowData> =
  | RowOfType<"model", D & { description: string | null }>
  | RowOfType<"markup", D>;

export type RowWithIdentifier<D extends RowData> =
  | RowOfType<"model", D & { identifier: string | null }>
  | RowOfType<"markup", D>;
