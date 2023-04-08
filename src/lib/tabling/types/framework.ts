import { GridApi as RootGridApi, ColumnApi as RootColumnApi, GridOptions } from "ag-grid-community";

import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";
import * as rows from "../rows";

export type GridApi<R extends rows.Row> = RootGridApi<R>;

export type ColumnApi = RootColumnApi;

export type GridApis<R extends rows.Row> = {
  readonly grid: GridApi<R>;
  readonly column: ColumnApi;
};

export const FooterGridIds = enumeratedLiterals(["footer", "page"] as const);
export type FooterGridId = EnumeratedLiteralType<typeof FooterGridIds>;

export const GridIds = enumeratedLiterals([...FooterGridIds.__ALL__, "data"] as const);
export type GridId = EnumeratedLiteralType<typeof GridIds>;

export type GridSet<T> = { [key in GridId]: T };

export type FooterGridSet<T> = { [key in FooterGridId]: T };

export type TableApiSet<R extends rows.Row> = {
  footer: GridApis<rows.RowSubType<R, "footer">>;
  data: GridApis<rows.RowSubType<R, rows.BodyRowType>>;
  page: GridApis<rows.RowSubType<R, "page">>;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type FrameworkGroup = { [key: string]: React.ComponentType<any> };

export type GridFramework = {
  readonly editors?: FrameworkGroup;
  readonly cells?: FrameworkGroup;
};

export type Framework = {
  readonly editors?: FrameworkGroup;
  readonly cells?: Partial<GridSet<FrameworkGroup>>;
};

export interface ITableApis<R extends rows.Row> {
  readonly store: Partial<TableApiSet<R>>;
  readonly get: (
    id: GridId,
  ) =>
    | GridApis<rows.RowSubType<R, rows.BodyRowType>>
    | GridApis<rows.RowSubType<R, "footer">>
    | GridApis<rows.RowSubType<R, "page">>
    | null;
  readonly set: (
    id: GridId,
    apis:
      | GridApis<rows.RowSubType<R, rows.BodyRowType>>
      | GridApis<rows.RowSubType<R, "footer">>
      | GridApis<rows.RowSubType<R, "page">>,
  ) => void;
  readonly clone: () => ITableApis<R>;
  readonly gridApis: (
    | GridApis<rows.RowSubType<R, rows.BodyRowType>>
    | GridApis<rows.RowSubType<R, "footer">>
    | GridApis<rows.RowSubType<R, "page">>
  )[];
}

export type TableOptionsSet = GridSet<GridOptions>;
