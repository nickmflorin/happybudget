import { useRef } from "react";

import * as hooks from "../hooks";

export const InitialGridRef: Table.DataGridInstance = {
  getCSVData: (fields?: string[]) => []
};

export const useDataGrid = (): NonNullRef<Table.DataGridInstance> => {
  return useRef<Table.DataGridInstance>(InitialGridRef);
};

export const InitialTableRef: Table.TableInstance<any, any> = {
  ...InitialGridRef,
  notify: (notification: TableNotification) => {},
  removeNotification: () => {},
  getFocusedRow: () => null,
  getRow: () => null,
  getRows: () => [],
  getRowsAboveAndIncludingFocusedRow: () => [],
  changeColumnVisibility: (changes: SingleOrArray<Table.ColumnVisibilityChange>) => {},
  applyTableChange: (event: SingleOrArray<Table.ChangeEvent<any>>) => {}
};

export const useTable = <
  R extends Table.RowData = object,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(): NonNullRef<Table.TableInstance<R, M>> => {
  return useRef<Table.TableInstance<R, M>>(InitialTableRef);
};

/* eslint-disable indent */
export const useTableIfNotDefined = <
  R extends Table.RowData = object,
  M extends Model.RowHttpModel = Model.RowHttpModel
>(
  table?: NonNullRef<Table.TableInstance<R, M>>
): NonNullRef<Table.TableInstance<R, M>> => hooks.useRefIfNotDefined<Table.TableInstance<R, M>>(useTable, table);
