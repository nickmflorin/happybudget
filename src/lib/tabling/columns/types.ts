import { Style as ReactPDFStyle } from "@react-pdf/types";
import { ColSpanParams as RootColSpanParams, ColDef } from "ag-grid-community";

import * as model from "../../model";
import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";
import * as events from "../events";
import * as rows from "../rows";
import * as types from "../types";

export const ColumnDataTypeIds = enumeratedLiterals([
  "text",
  "longText",
  "singleSelect",
  "phone",
  "email",
  "number",
  "contact",
  "currency",
  "sum",
  "percentage",
  "file",
  "date",
] as const);

export type ColumnDataTypeId = EnumeratedLiteralType<typeof ColumnDataTypeIds>;

export const ColumnAlignments = enumeratedLiterals(["right", "left"]);
export type ColumnAlignment = EnumeratedLiteralType<typeof ColumnAlignments> | null;

export const ColumnTypeIds = enumeratedLiterals(["action", "body", "calculated", "fake"] as const);
export type ColumnTypeId = EnumeratedLiteralType<typeof ColumnTypeIds>;

export interface ColumnDataType {
  readonly id: ColumnDataTypeId;
  readonly style?: React.CSSProperties;
  readonly icon?: IconOrElement;
  readonly pdfOverrides?: Omit<Partial<ColumnDataType>, "id">;
  readonly headerOverrides?: Omit<Partial<ColumnDataType>, "id" | "icon" | "pdfOverrides">;
}

export type ColumnFieldName<R extends rows.Row = rows.Row> = keyof rows.RowData<R> & string;

export type ColSpanParams<
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = RootColSpanParams<R> & {
  readonly columns: RealColumn<R, M>[];
};

interface PdfFooterColumn<
  R extends rows.Row = rows.Row,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> {
  readonly value?: T;
  readonly textStyle?: ReactPDFStyle;
}

export type OmitColDefParams =
  | "field"
  | "colId"
  | "headerName"
  | "cellRenderer"
  | "cellClass"
  | "getCellClass"
  | "colSpan"
  | "editable"
  | "valueGetter"
  | "onCellDoubleClicked";

export type ParsedColumnField<
  R extends rows.Row = rows.Row,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = {
  field: string;
  value: T;
};

export type HiddenColumns = { [key: string]: boolean };

/* export type EditColumnRowConfig<
     R extends rows.Row,
     RT extends "model" | "markup" | "group" = "model" | "markup" | "group",
     RW extends rows.Row<R, RT> = rows.Row<R, RT>,
   > = {
     readonly typeguard: (row: R) => row is RW;
     readonly conditional?: (row: RW) => boolean;
     readonly behavior: rows.EditRowActionBehavior;
     readonly action: (row: RW, hovered: boolean) => void;
     readonly tooltip?:
       | string
       | ((row: RW, params: { hovered: boolean; disabled: boolean }) => string);
     readonly disabled?: boolean | ((row: RW, hovered: boolean) => boolean);
   }; */

export type ColumnCallbackParams<R extends rows.Row = rows.Row> = {
  readonly row: rows.RowSubType<R, rows.BodyRowType>;
};

export type BaseColumn<
  R extends rows.Row = rows.Row,
  CType extends ColumnTypeId = ColumnTypeId,
> = CType extends ColumnTypeId
  ? Omit<ColDef<R>, OmitColDefParams> & { readonly cType: CType }
  : never;

export type RealColumnMixin<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = {
  readonly index?: number;
  readonly cellRenderer?: string | Partial<types.GridSet<string>>;
  readonly cellClass?: types.CellClassName<rows.RowSubType<R, rows.BodyRowType>, N, T>;
  readonly footer?: FooterColumn<R, M>;
  readonly colSpan?: (params: ColSpanParams<R, M>) => number;
  readonly onCellFocus?: (params: types.CellFocusedParams<R, M>) => void;
  readonly onCellUnfocus?: (params: types.CellFocusedParams<R, M>) => void;
  readonly onCellDoubleClicked?: (row: rows.RowSubType<R, "model">) => void;
};

export type ModelColumnMixin<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = {
  readonly field: N;
  /**
   * Used in the case that nullish values are encountered (i.e. blank strings).
   */
  readonly nullValue: T;
  /**
   * A callback or explicit value that will be used to construct the {@link rows.RowData} object
   * when a row is created and the created row does not specify a value for the field associated
   * with this column.
   */
  readonly defaultValueOnCreate?: redux.DefaultValueOnCreate<R>;
  /**
   * A callback or explicit value that will be used to update the {@link rows.RowData} object
   * when a row is updated and a null value is specified for the field associated with this column.
   */
  // readonly defaultValueOnUpdate?: DefaultValueOnUpdate<R>;
  /**
   * The default behavior to obtain the value for a cell is to access the attribute on the row
   * {@link rows.Row} associated with the field {@link N} of the column.  If this behavior is not
   * desired, this callback can be provided such that the cell's value is obtained from the
   * underlying model, {@link M}.
   */
  readonly getRowValue?: (m: M) => T;
  /**
   * A callback that indicates whether or not the column is applicable for a given model, {@link M}.
   * If the column is not applicable, a warning will not be issued if the column's field cannot be
   * accessed from an attribute on the model, {@link M}.
   */
  readonly isApplicableForModel?: (m: M) => boolean;
  /**
   * A callback that indicates whether or not the column is applicable for a given row type,
   * {@link rows.RowType}. If the column is not applicable, the row {@link rows.Row} will not
   * include the Column's field in its data, {@link rows.RowData}.
   */
  readonly isApplicableForRowType?: (rt: rows.RowType) => boolean;
};

export type FakeColumn<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = BaseColumn<R, "fake"> & ModelColumnMixin<R, M, N, T>;

export const ActionColumnIds = enumeratedLiterals(["checkbox", "edit", "drag"] as const);
export type ActionColumnId = EnumeratedLiteralType<typeof ActionColumnIds>;

export type ActionColumn<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = BaseColumn<R, "action"> &
  RealColumnMixin<R, M, N, T> & {
    readonly colId: ActionColumnId;
  };

export type DataColumnMixin<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = ModelColumnMixin<R, M, N, T> & {
  // This field will be used to pull data from the Markup model if applicable.
  readonly markupField?: keyof model.Markup;
  // This field will be used to pull data from the Group model if applicable.
  readonly groupField?: keyof model.Group;
  /* This field, when false, indicates that the column value should not be pulled from the model,
     but is instead set by other means (usually value getters). */
  readonly isRead?: boolean;
  readonly headerName?: string;
  readonly dataType?: ColumnDataTypeId;
  readonly page?: FooterColumn<R, M>;
  readonly defaultHidden?: boolean;
  readonly canBeHidden?: boolean;
  readonly canBeExported?: boolean;
  readonly requiresAuthentication?: boolean;
  readonly includeInPdf?: boolean;
  readonly isApplicableForModel?: ModelColumnMixin<R, M, N, T>["isApplicableForModel"];
  readonly isApplicableForRowType?: ModelColumnMixin<R, M, N, T>["isApplicableForRowType"];
  readonly valueGetter?: (
    row: rows.RowSubType<R, rows.BodyRowType>,
    rows: rows.RowSubType<R, rows.BodyRowType>[],
  ) => T;
  readonly getHttpValue?: (value: T) => JsonValue;
  readonly processCellForCSV?: (row: R) => string | number;
  readonly processCellForClipboard?: (row: R) => string | number;
  // PDF Column Properties
  readonly pdfHeaderName?: string;
  readonly pdfWidth?: number;
  readonly pdfFlexGrow?: true;
  readonly pdfFooter?: PdfFooterColumn<R, N, T>;
  readonly pdfCellProps?: types.PdfCellStandardProps<R, M, N, T>;
  readonly pdfHeaderCellProps?: types.PdfCellStandardProps<R, M, N, T>;
  readonly pdfCellRenderer?: (params: types.PdfCellCallbackParams<R, M, N, T>) => JSX.Element;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly pdfFormatter?: NativeFormatter<any>;
  readonly pdfValueGetter?: (
    r: rows.RowSubType<R, rows.BodyRowType>,
    rows: rows.RowSubType<R, rows.BodyRowType>[],
  ) => T;
  readonly pdfFooterValueGetter?: T | ((rows: rows.RowSubType<R, rows.BodyRowType>[]) => T);
  /* NOTE: This only applies for the individual Account tables, not the the overall Accounts */
  readonly pdfChildFooter?: (s: M) => PdfFooterColumn<R, N, T>;
};

export type BodyColumn<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = BaseColumn<R, "body"> &
  RealColumnMixin<R, M, N, T> &
  DataColumnMixin<R, M, N, T> & {
    readonly selectable?: boolean | ((params: ColumnCallbackParams<R>) => boolean) | undefined;
    readonly editable?: boolean | ((params: ColumnCallbackParams<R>) => boolean);
    readonly smartInference?: boolean;
    readonly processCellFromClipboard?: (value: string) => T;
    /**
     * The fields that a given column, {@link Column}, is derived from.
     */
    readonly parsedFields?: string[];
    /**
     * A callback that is used when a given column, {@link Column}, is derived from multiple other
     * columns, {@link Column[]}.  The parser must take the value for the current column and parse
     * the value such that the contributing part from each parsed column is returned separately.
     *
     * If `parsedFields` is provided, this callback must be provided as well.
     */
    readonly parseIntoFields?: (value: T) => ParsedColumnField<R, N, T>[];
    readonly onDataChange?: (
      id: rows.RowId<"model">,
      event: events.CellChange<rows.RowSubType<R, "model">, ColumnFieldName<R>>,
    ) => void;
    readonly refreshColumns?: (
      change: events.CellChange<rows.RowSubType<R, "model">, ColumnFieldName<R>>,
    ) => string[];
  };

export type CalculatedColumn<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = BaseColumn<R, "calculated"> & RealColumnMixin<R, M, N, T> & DataColumnMixin<R, M, N, T>;

export type DataColumn<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = BodyColumn<R, M, N, T> | CalculatedColumn<R, M, N, T>;

export type ModelColumn<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = DataColumn<R, M, N, T> | FakeColumn<R, M, N, T>;

export type RealColumn<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> = BodyColumn<R, M, N, T> | CalculatedColumn<R, M, N, T> | ActionColumn<R, M>;

export type Column<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> =
  | BodyColumn<R, M, N, T>
  | ActionColumn<R, M>
  | CalculatedColumn<R, M, N, T>
  | FakeColumn<R, M, N, T>;

export interface FooterColumn<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends ColumnFieldName<R> = ColumnFieldName<R>,
  T = types.CellValue<R, N>,
> extends Pick<DataColumn<R, M, N, T>, "colSpan"> {
  readonly cellStyle?: types.CellStyle<rows.RowSubType<R, rows.BodyRowType>, N, T>;
}

export type ColumnVisibilityChange = {
  readonly field: string;
  readonly visible: boolean;
};
