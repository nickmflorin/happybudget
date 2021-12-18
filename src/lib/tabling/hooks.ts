import { useRef } from "react";

import * as hooks from "../hooks";

export const InitialGridRef: Table.DataGridInstance = {
  getCSVData: () => []
};

export const useDataGrid = (): NonNullRef<Table.DataGridInstance> => {
  return useRef<Table.DataGridInstance>(InitialGridRef);
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const InitialTableRef: Table.TableInstance<any, any> = {
  ...InitialGridRef,
  notify: (notification: TableNotification) => {
    console.warn(
      `Cannot dispatch notification ${JSON.stringify(
        notification
      )} to table because table ref has not been attached yet.`
    );
  },
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  removeNotification: () => {},
  getColumns: () => [],
  getFocusedRow: () => null,
  getRow: () => null,
  getRows: () => [],
  getRowsAboveAndIncludingFocusedRow: () => [],
  /* eslint-disable @typescript-eslint/no-empty-function */
  changeColumnVisibility: () => {},
  /* eslint-disable @typescript-eslint/no-empty-function */
  applyTableChange: () => {}
};

export const useTable = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(): NonNullRef<
  Table.TableInstance<R, M>
> => {
  return useRef<Table.TableInstance<R, M>>(InitialTableRef);
};

export const useTableIfNotDefined = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  table?: NonNullRef<Table.TableInstance<R, M>>
): NonNullRef<Table.TableInstance<R, M>> => hooks.useRefIfNotDefined<Table.TableInstance<R, M>>(useTable, table);
