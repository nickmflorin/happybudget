declare namespace Table {
  type CellPosition = Omit<import("@ag-grid-community/core").CellPosition, "rowPinned">;

  type CellKeyDownEvent = import("@ag-grid-community/core").CellKeyDownEvent;

  type CellCallbackParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly column: Column<R, M>;
    readonly row: BodyRow<R>;
  };

  interface _CellClassNameArray<P> {
    [n: number]: RawClassName | ClassNameParamCallback<P>;
  }
  type ClassName<P> = RawClassName | ClassNameParamCallback<P> | _CellClassNameArray<P>;

  type CellClassName = ClassName<import("@ag-grid-community/core").CellClassParams>;

  type PdfCellCallbackParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> = {
    readonly row?: Row<R>;
    readonly colIndex: number;
    readonly column: Column<R, M, V>;
    readonly isHeader: boolean;
    readonly rawValue: V | null;
    readonly value: string;
    readonly indented: boolean;
  };

  type PdfCellCallback<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any, RV = any> = (
    params: PdfCellCallbackParams<R, M, V>
  ) => RV;

  type PdfOptionalCellCallback<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V = any,
    RV = any
  > = RV | PdfCellCallback<R, M, V> | undefined;

  interface _PdfCellClassName<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> {
    [n: number]: PdfOptionalCellCallback<R, M, V, string> | _PdfCellClassName<R, M, V>;
  }
  type PdfCellClassName<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> =
    | PdfOptionalCellCallback<R, M, V, string>
    | _PdfCellClassName<R, M, V>;

  interface _PdfCellStyle<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> {
    [n: number]: PdfOptionalCellCallback<R, M, V, import("@react-pdf/types").Style> | _PdfCellStyle<R, M, V>;
  }
  type PdfCellStyle<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> =
    | PdfOptionalCellCallback<R, M, V, import("@react-pdf/types").Style>
    | _PdfCellStyle<R, M, V>;

  type PdfCellStandardProps<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> = {
    readonly style?: PdfCellStyle<R, M, V>;
    readonly className?: PdfCellClassName<R, M, V>;
    readonly textStyle?: PdfCellStyle<R, M, V>;
    readonly textClassName?: PdfCellClassName<R, M, V>;
  };

  type Cell<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly row: BodyRow<R>;
    readonly column: Column<R, M>;
    readonly rowNode: import("@ag-grid-community/core").RowNode;
  };

  type CellFocusedParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly cell: Cell<R, M>;
    readonly apis: GridApis;
  };

  type CellFocusChangedParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly cell: Cell<R, M>;
    readonly previousCell: Cell<R, M> | null;
    readonly apis: GridApis;
  };
}
