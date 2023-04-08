import { ReactNode } from "react";

import { Style as ReactPDFStyle } from "@react-pdf/types";
import {
  CellClassParams,
  ICellRendererParams,
  CellPosition as RootCellPosition,
  RowNode,
} from "ag-grid-community";

import { store } from "application";

import * as model from "../../model";
import * as ui from "../../ui";
import * as columns from "../columns";
import * as rows from "../rows";

import * as formatting from "./formatting";
import { GridId, GridApis } from "./framework";
import * as table from "./table";

import { ClassName } from ".";

export type CellValue<
  R extends rows.Row = rows.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
> = N extends columns.ColumnFieldName<R> ? rows.RowData<R>[N] : never;

export type CellClassName<
  R extends rows.RowOfType<rows.BodyRowType> = rows.RowOfType<rows.BodyRowType>,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = ClassName<CellClassParams<R, T>>;

export interface CellStyleFunc<
  R extends rows.RowOfType<rows.BodyRowType> = rows.RowOfType<rows.BodyRowType>,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> {
  (cellClassParams: CellClassParams<R, T>): ui.Style | null | undefined;
}

export type CellStyle<
  R extends rows.RowOfType<rows.BodyRowType> = rows.RowOfType<rows.BodyRowType>,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = ui.Style | CellStyleFunc<R, N, T>;

// TODO: Move to Cell Renderer file.
export interface CellProps<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
  C extends table.TableContext = table.TableContext,
  S extends store.TableStore<R> = store.TableStore<R>,
  CL extends columns.RealColumn<R, M, N, T> = columns.BodyColumn<R, M, N, T>,
> extends ICellRendererParams<R, T>,
    ui.ComponentProps {
  readonly tableContext: C;
  readonly tooltip?: ui.Tooltip;
  readonly hideClear?: boolean;
  readonly customCol: CL;
  readonly gridId: GridId;
  readonly prefixChildren?: JSX.Element;
  readonly suffixChildren?: JSX.Element;
  readonly icon?:
    | IconOrElement
    | ((row: rows.RowSubType<R, rows.BodyRowType>) => IconOrElement | undefined | null);
  readonly innerCellClassName?: string | undefined | ((r: R) => string | undefined);
  readonly innerCellStyle?: ui.Style | undefined | ((r: R) => ui.Style | undefined);
  readonly table: table.TableInstance<R, M>;
  /* Note: This is only applied for the data grid rows/cells - so we have to be careful.  We need a
     better way of establishing which props are available to cells based on which grid they lie in.
		 */
  readonly getRowColorDef: (row: rows.RowSubType<R, rows.BodyRowType>) => rows.RowColorDef;
  readonly selector: (state: store.ApplicationStore) => S;
  readonly onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  // readonly onEvent?: (event: Event<R, M, EditableRow<R>>) => void;
}

export type Cell<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = {
  readonly row: R;
  readonly column: columns.RealColumn<R, M>;
  readonly rowNode: RowNode<R>;
};

export type CellFocusedParams<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = {
  readonly cell: Cell<R, M>;
  readonly apis: GridApis<R>;
};

export type CellFocusChangedParams<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = {
  readonly cell: Cell<R, M>;
  readonly previousCell: Cell<R, M> | null;
  readonly apis: GridApis<R>;
};

// TODO: Move to Cell Renderer file.
export type CellWithChildrenProps<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
  C extends table.TableContext = table.TableContext,
  S extends store.TableStore<R> = store.TableStore<R>,
  CL extends columns.RealColumn<R, M, N, T> = columns.BodyColumn<R, M, N, T>,
> = Omit<CellProps<R, M, N, T, C, S, CL>, "value"> & {
  readonly children: ReactNode;
};

// TODO: Move to Cell Renderer file.
export type ValueCellProps<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
  C extends table.TableContext = table.TableContext,
  S extends store.TableStore<R> = store.TableStore<R>,
  CL extends columns.DataColumn<R, M, N, T> = columns.DataColumn<R, M, N, T>,
> = CellProps<R, M, N, T, C, S, CL> & {
  /* This is used for extending cells.  Normally, the value formatter will be included on the ColDef
     of the associated column.  But when extending a Cell, we sometimes want to provide a formatter
     for that specific cell. */
  readonly valueFormatter?: formatting.TableValueFormatter<R, N, T>;
};

// TODO: Move to Cell Renderer file.
export type CalculatedCellProps<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
  C extends table.TableContext = table.TableContext,
  S extends store.TableStore<R> = store.TableStore<R>,
> = Omit<
  ValueCellProps<R, M, N, T, C, S, columns.CalculatedColumn<R, M, N, T>>,
  "prefixChildren"
> & {
  readonly hasInfo?:
    | boolean
    | ((
        cell: CellConstruct<
          rows.RowSubType<R, "model">,
          columns.CalculatedColumn<
            rows.RowSubType<R, "model">,
            M,
            N & columns.ColumnFieldName<rows.RowSubType<R, "model">>,
            T
          >,
          M,
          N & columns.ColumnFieldName<rows.RowSubType<R, "model">>,
          T
        >,
      ) => boolean | undefined);
  readonly onInfoClicked?: (
    cell: CellConstruct<
      rows.RowSubType<R, "model">,
      columns.CalculatedColumn<
        rows.RowSubType<R, "model">,
        M,
        N & columns.ColumnFieldName<rows.RowSubType<R, "model">>,
        T
      >,
      M,
      N & columns.ColumnFieldName<rows.RowSubType<R, "model">>,
      T
    >,
  ) => void;
  readonly infoTooltip?: (
    cell: CellConstruct<
      rows.RowSubType<R, "model">,
      columns.CalculatedColumn<
        rows.RowSubType<R, "model">,
        M,
        N & columns.ColumnFieldName<rows.RowSubType<R, "model">>,
        T
      >,
      M,
      N & columns.ColumnFieldName<rows.RowSubType<R, "model">>,
      T
    >,
  ) => ui.TooltipContent | null;
};

export type CellPosition = Omit<RootCellPosition, "rowPinned">;

export type CellConstruct<
  R extends rows.RowOfType<rows.BodyRowType>,
  C extends columns.DataColumn<R, M, N, T>,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = {
  readonly col: C;
  readonly row: R;
};

export type PdfCellCallbackParams<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = {
  readonly row?: R;
  readonly colIndex: number;
  readonly column: columns.DataColumn<R, M, N, T>;
  readonly isHeader: boolean;
  readonly rawValue: T;
  readonly value: string;
  readonly indented: boolean;
};

export type PdfCellCallback<
  RV,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = (params: PdfCellCallbackParams<R, M, N, T>) => RV;

export type PdfOptionalCellCallback<
  RV,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = RV | PdfCellCallback<RV, R, M, N, T> | undefined;

export interface _PdfCellClassName<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> {
  [n: number]: PdfOptionalCellCallback<string, R, M, N, T> | _PdfCellClassName<R, M, N, T>;
}

export type PdfCellClassName<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = PdfOptionalCellCallback<string, R, M, N, T> | _PdfCellClassName<R, M, N, T>;

export interface _PdfCellStyle<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> {
  [n: number]: PdfOptionalCellCallback<ReactPDFStyle, R, M, N, T> | _PdfCellStyle<R, M, N, T>;
}

export type PdfCellStyle<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = PdfOptionalCellCallback<ReactPDFStyle, R, M, N, T> | _PdfCellStyle<R, M, N, T>;

export type PdfCellStandardProps<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = CellValue<R, N>,
> = {
  readonly style?: PdfCellStyle<R, M, N, T>;
  readonly className?: PdfCellClassName<R, M, N, T>;
  readonly textStyle?: PdfCellStyle<R, M, N, T>;
  readonly textClassName?: PdfCellClassName<R, M, N, T>;
};
