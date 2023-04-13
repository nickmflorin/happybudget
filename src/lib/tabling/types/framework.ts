import { GridApi as RootGridApi, ColumnApi as RootColumnApi, GridOptions } from "ag-grid-community";

import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";
import * as rows from "../rows";

export type ColumnApi = RootColumnApi;

export type RowForGridId<R extends rows.Row, G extends GridId = GridId> = {
  footer: rows.RowSubType<R, "footer">;
  page: rows.RowSubType<R, "page">;
  data: rows.RowSubType<R, rows.BodyRowType>;
}[G];

export type GridApi<R extends rows.Row, G extends GridId = GridId> = G extends GridId
  ? RootGridApi<RowForGridId<R, G>>
  : never;

export type GridApis<R extends rows.Row, G extends GridId = GridId> = G extends GridId
  ? {
      readonly grid: GridApi<R, G>;
      readonly column: ColumnApi;
    }
  : never;

export const FooterGridIds = enumeratedLiterals(["footer", "page"] as const);
export type FooterGridId = EnumeratedLiteralType<typeof FooterGridIds>;

export const GridIds = enumeratedLiterals([...FooterGridIds.__ALL__, "data"] as const);
export type GridId = EnumeratedLiteralType<typeof GridIds>;

export type GridSet<T> = { [key in GridId]: T };

export type FooterGridSet<T> = { [key in FooterGridId]: T };

export type TableApiSet<R extends rows.Row> = { [key in GridId]: GridApis<R, key> | null };

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

export type TableOptionsSet = GridSet<GridOptions>;
