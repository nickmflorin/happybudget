import { useMemo } from "react";
import { map, isNil, filter } from "lodash";

import { hooks, tabling } from "lib";

import {
  ReadWriteTable,
  ReadWriteTableProps,
  ReadWriteDataGrid,
  ReadWriteDataGridProps,
  ReadWriteGridProps,
  DataGridProps,
  ReadWriteGrid,
  DataGrid
} from "components/tabling/generic";

type ReadWriteModelDataGridProps<R extends Table.Row = any, M extends Model.Model = any> = DataGridProps<R, M> &
  ReadWriteDataGridProps<R, M> &
  Omit<ReadWriteGridProps<R, M>, "id">;

export interface ReadWriteModelTableProps<R extends Table.Row = any, M extends Model.Model = any>
  extends ReadWriteTableProps<R, M> {
  readonly tableRef?: NonNullRef<Table.ReadWriteTableRefObj<R, M>>;
  readonly models: M[];
}

const DG = DataGrid<ReadWriteModelDataGridProps>()(ReadWriteGrid);
const ReadWrite = ReadWriteDataGrid<ReadWriteModelDataGridProps>()(DG);

const ReadWriteModelTable = <R extends Table.Row = any, M extends Model.Model = any>(
  props: ReadWriteModelTableProps<R, M>
): JSX.Element => {
  const convertedData = useMemo<R[]>((): R[] => {
    const tableData = tabling.util.createTableData<Table.Column<R, M>, R, M>(
      filter(props.columns, (c: Table.Column<R, M>) => c.isRead !== false),
      props.models,
      {
        defaultNullValue: null,
        // ordering,
        getRowMeta: (m: M) => ({
          label:
            (!isNil(props.getRowLabel) && typeof props.getRowLabel === "function"
              ? props.getRowLabel(m)
              : props.getRowLabel) || m.id,
          gridId: "data"
        })
      }
    );
    return map(tableData, (dt: Table.ModelWithRow<R, M>) => dt.row);
  }, [hooks.useDeepEqualMemo(props.models)]);

  // TODO: Figure out why we have to pass in the ID and readOnly.
  return (
    <ReadWriteTable<R, M> {...props}>
      {(params: TableUi.ReadWriteDataGridRenderParams<R, M>) => (
        <ReadWrite {...props} {...params} data={convertedData} />
      )}
    </ReadWriteTable>
  );
};

export default ReadWriteModelTable;
