declare namespace Table {
  type AGFormatterParams = import("@ag-grid-community/core").ValueFormatterParams;
  type AGFormatter = (params: AGFormatterParams) => string;

  type NativeFormatterParams<P> = P | null;
  type NativeFormatter<P> = (params: NativeFormatterParams<P>) => string;

  type ColDef = import("@ag-grid-community/core").ColDef;

  type AgColumn = import("@ag-grid-community/core").Column;

  type ColumnTypeId =
    | "text"
    | "longText"
    | "singleSelect"
    | "phone"
    | "email"
    | "number"
    | "contact"
    | "currency"
    | "sum"
    | "percentage"
    | "file"
    | "date";

  type ColumnAlignment = "right" | "left" | null;
  type TableColumnTypeId = "action" | "body" | "calculated" | "fake";

  interface ColumnType {
    readonly id: ColumnTypeId;
    readonly style?: React.CSSProperties;
    readonly icon?: IconOrElement;
    readonly pdfOverrides?: Omit<Partial<ColumnType>, "id">;
    readonly headerOverrides?: Omit<Partial<ColumnType>, "id" | "icon" | "pdfOverrides">;
  }

  type ColSpanParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = import("@ag-grid-community/core").ColSpanParams & {
    readonly columns: Column<R, M>[];
  };

  interface PdfFooterColumn<V = any> {
    readonly value?: V | null;
    readonly textStyle?: import("@react-pdf/types").Style;
  }

  type PdfValueGetter<R extends RowData, V = any> = (r: BodyRow<R>, rows: BodyRow<R>[]) => V | null;
  type PdfFooterValueGetter<R extends RowData, V = any> = (rows: BodyRow<R>[]) => V | null;

  type OmitColDefParams =
    | "field"
    | "colId"
    | "headerName"
    | "cellRenderer"
    | "cellClass"
    | "getCellClass"
    | "colSpan"
    | "cellStyle"
    | "editable"
    | "valueGetter"
    | "onCellDoubleClicked";

  type ParsedColumnField<R extends RowData, V = any> = { field: keyof R; value: V };

  type HiddenColumns = { [key: string]: boolean };

  type EditColumnRowConfig<
    R extends RowData,
    RW extends Table.NonPlaceholderBodyRow<R> = Table.NonPlaceholderBodyRow<R>
  > = {
    readonly conditional: (row: RW) => boolean;
    readonly hidden?: (row: RW, hovered: boolean) => boolean;
    readonly behavior: EditRowActionBehavior;
    readonly action: (row: any, hovered: boolean) => void;
    readonly tooltip?: string | ((row: RW, params: { hovered: boolean; disabled: boolean }) => string);
    readonly disabled?: boolean | ((row: RW, hovered: boolean) => boolean);
  };

  interface Column<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V = any,
    PDFM extends Model.RowHttpModel = any
  > extends Omit<ColDef, OmitColDefParams> {
    readonly field?: keyof R;
    readonly colId?: string;
    readonly headerName?: string;
    readonly pdfHeaderName?: string;
    readonly columnType?: ColumnTypeId;
    readonly tableColumnType: TableColumnTypeId;
    readonly index?: number;
    readonly nullValue?: any;
    readonly selectable?: boolean | ((params: CellCallbackParams<R, M>) => boolean) | undefined;
    readonly editable?: boolean | ((params: CellCallbackParams<R, M>) => boolean);
    readonly footer?: FooterColumn<R, M>;
    readonly page?: FooterColumn<R, M>;
    readonly isRead?: boolean;
    readonly isWrite?: boolean;
    readonly cellRenderer?: string | Partial<GridSet<string>>;
    readonly cellClass?: CellClassName;
    readonly cellStyle?: React.CSSProperties;
    readonly defaultHidden?: boolean;
    readonly canBeHidden?: boolean;
    readonly canBeExported?: boolean;
    readonly requiresAuthentication?: boolean;
    readonly smartInference?: boolean;
    readonly defaultNewRowValue?: boolean;
    readonly valueGetter?: (row: Table.BodyRow<R>, rows: Table.BodyRow<R>[]) => any;
    readonly getRowValue?: (m: M) => R[keyof R];
    readonly getHttpValue?: (value: V) => any;
    readonly onDataChange?: (id: ModelRowId, event: Table.CellChange<R>) => void;
    readonly colSpan?: (params: ColSpanParams<R, M>) => number;
    readonly onCellFocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M>) => void;
    readonly refreshColumns?: (change: CellChange<V>) => keyof R | (keyof R)[] | null;
    readonly parseIntoFields?: (value: V) => ParsedColumnField<R, V>[];
    readonly processCellForCSV?: (row: R) => string | number;
    readonly processCellForClipboard?: (row: R) => string | number;
    readonly processCellFromClipboard?: (value: string) => V | null;
    readonly onCellDoubleClicked?: (row: ModelRow<R>) => void;
    readonly includeInPdf?: boolean;
    /* In the PDF case, since we cannot dynamically resize columns, the width
			 refers to a ratio of the column width to the overall table width assuming
			 that all columns are present.  When columns are hidden/shown, this ratio
			 is adjusted. */
    readonly pdfWidth?: number;
    readonly pdfFlexGrow?: true;
    readonly pdfCellProps?: PdfCellStandardProps<R, PDFM, V>;
    readonly pdfHeaderCellProps?: PdfCellStandardProps<R, PDFM, V>;
    readonly pdfFooter?: PdfFooterColumn<V>;
    readonly pdfCellContentsVisible?: PdfOptionalCellCallback<R, PDFM, V, boolean>;
    readonly pdfFormatter?: NativeFormatter<V>;
    readonly pdfValueGetter?: PdfValueGetter<R, V>;
    readonly pdfFooterValueGetter?: V | null | PdfFooterValueGetter<R, V>;
    readonly pdfCellRenderer?: (params: PdfCellCallbackParams<R, PDFM, V>) => JSX.Element;
    /* NOTE: This only applies for the individual Account tables, not the the
			 overall Accounts */
    readonly pdfChildFooter?: (s: PDFM) => PdfFooterColumn<V>;
  }

  type PdfColumn<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V = any,
    MM extends Model.RowHttpModel = any
  > = Column<R, MM, V, M>;

  interface FooterColumn<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
    extends Pick<Column<R, M>, "colSpan"> {
    readonly cellStyle?: React.CSSProperties;
  }

  interface CookieNames {
    readonly hiddenColumns?: string;
  }

  type EditRowActionBehavior = "expand" | "edit";

  interface ColumnVisibilityChange {
    readonly field: string;
    readonly visible: boolean;
  }
}
