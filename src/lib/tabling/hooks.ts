import { useRef } from "react";

import * as hooks from "../hooks";

export const InitialGridRef: Table.DataGridInstance = {
  getCSVData: () => []
};

export const useDataGrid = (): NonNullRef<Table.DataGridInstance> => {
  return useRef<Table.DataGridInstance>(InitialGridRef);
};

export const InitialTableRef: Table.TableInstance<Table.RowData, Model.RowHttpModel> = {
  ...InitialGridRef,
  notifications: [],
  notify: (notifications: SingleOrArray<UINotificationType>) => {
    console.warn(
      `Cannot dispatch notifications ${JSON.stringify(
        notifications
      )} to table because table ref has not been attached yet.`
    );
    return [];
  },
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  clearNotifications: () => {},
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  handleRequestError: () => [],
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
  return useRef<Table.TableInstance<R, M>>(InitialTableRef as Table.TableInstance<R, M>);
};

export const useTableIfNotDefined = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  table?: NonNullRef<Table.TableInstance<R, M>>
): NonNullRef<Table.TableInstance<R, M>> => hooks.useRefIfNotDefined<Table.TableInstance<R, M>>(useTable, table);
