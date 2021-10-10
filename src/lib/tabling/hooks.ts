import { useEffect, useState, useRef } from "react";
import { isNil, filter, map } from "lodash";

import { ColumnApi, GridApi } from "@ag-grid-community/core";

import * as hooks from "../hooks";
import TableApis from "./apis";
import * as cookies from "./cookies";

type UseHiddenColumnsParams<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
  readonly cookie?: string;
  readonly columns: Table.Column<R, M>[];
  readonly apis: TableApis;
};

type UseHiddenColumnsReturnType<R extends Table.RowData> = [
  (keyof R | string)[],
  (changes: SingleOrArray<Table.ColumnVisibilityChange<R>>, sizeToFit?: boolean) => void
];

export const useHiddenColumns = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  params: UseHiddenColumnsParams<R, M>
): UseHiddenColumnsReturnType<R> => {
  const [hiddenColumns, _setHiddenColumns] = useState<(keyof R | string)[]>([]);

  useEffect(() => {
    let setColumnsFromCookies = false;
    if (!isNil(params.cookie)) {
      const hiddenColumnsInCookies: (keyof R | string)[] | null = cookies.getHiddenColumns(
        params.cookie,
        filter(
          map(
            filter(params.columns, (c: Table.Column<R, M>) => c.canBeHidden !== false),
            (c: Table.Column<R, M>) => c.field || c.colId
          ),
          (f: keyof R | string | undefined) => !isNil(f)
        ) as (keyof R | string)[]
      );
      if (!isNil(hiddenColumnsInCookies)) {
        _setHiddenColumns(hiddenColumnsInCookies);
        setColumnsFromCookies = true;
      }
    }
    if (setColumnsFromCookies === false) {
      // If there the hidden columns are not stored in cookies or the hidden columns stored in
      // cookies are corrupted, we want to set the hidden columns based on the defaultHidden property.
      _setHiddenColumns(
        filter(
          map(
            filter(params.columns, (c: Table.Column<R, M>) => c.canBeHidden !== false && c.defaultHidden === true),
            (c: Table.Column<R, M>) => c.field
          ),
          (f: keyof R | string | undefined) => !isNil(f)
        ) as (keyof R | string)[]
      );
    }
  }, [params.cookie]);

  const changeColumnVisibility = hooks.useDynamicCallback(
    (changes: SingleOrArray<Table.ColumnVisibilityChange<R>>, sizeToFit?: boolean) => {
      const arrayOfChanges = Array.isArray(changes) ? changes : [changes];
      map(arrayOfChanges, (change: Table.ColumnVisibilityChange<R>) =>
        params.apis.columnMap((api: ColumnApi) => api.setColumnVisible(change.field as string, change.visible))
      );
      if (sizeToFit !== false) {
        params.apis.gridMap((api: GridApi) => api.sizeColumnsToFit());
      }
      const newHiddenColumns = cookies.applyHiddenColumnChanges(changes, hiddenColumns);
      _setHiddenColumns(newHiddenColumns);
      if (!isNil(params.cookie)) {
        cookies.setHiddenColumns(params.cookie, newHiddenColumns);
      }
    }
  );

  return [hiddenColumns, changeColumnVisibility];
};

export const InitialGridRef: Table.DataGridInstance<any> = {
  getCSVData: (fields?: string[]) => []
};

export const useDataGrid = <R extends Table.RowData = object>(): NonNullRef<Table.DataGridInstance<R>> => {
  return useRef<Table.DataGridInstance<R>>(InitialGridRef);
};

export const InitialTableRef: Table.TableInstance<any, any> = {
  ...InitialGridRef,
  getFocusedRow: () => null,
  getRow: () => null,
  getRows: () => [],
  getRowsAboveAndIncludingFocusedRow: () => [],
  changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange<any>>, sizeToFit?: boolean) => {},
  applyTableChange: (event: SingleOrArray<Table.ChangeEvent<any>>) => {},
  applyGroupColorChange: (group: Model.Group) => {}
};

export const useTable = <R extends Table.RowData = object, M extends Model.HttpModel = Model.HttpModel>(): NonNullRef<
  Table.TableInstance<R, M>
> => {
  return useRef<Table.TableInstance<R, M>>(InitialTableRef);
};

/* eslint-disable indent */
export const useTableIfNotDefined = <R extends Table.RowData = object, M extends Model.HttpModel = Model.HttpModel>(
  table?: NonNullRef<Table.TableInstance<R, M>>
): NonNullRef<Table.TableInstance<R, M>> => hooks.useRefIfNotDefined<Table.TableInstance<R, M>>(useTable, table);
