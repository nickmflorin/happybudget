import { useState, useEffect } from "react";
import { map, isNil, includes, filter } from "lodash";

import { hooks, tabling } from "lib";

import { DataGrid, DataGridProps } from "components/tabling/generic";

export interface ModelDataGridProps<R extends BudgetTable.Row, M extends Model.Model>
  extends Omit<DataGridProps<R, M>, "data"> {
  readonly getRowLabel?: (m: M) => number | string | null;
  readonly data: M[];
}

const ModelDataGrid = <R extends Table.Row, M extends Model.Model>({
  data,
  getRowLabel,
  ...props
}: ModelDataGridProps<R, M>): JSX.Element => {
  const [table, setTable] = useState<R[]>([]);

  useEffect(() => {
    const readColumns = filter(props.columns, (c: Table.Column<R, M>) => {
      const fieldBehavior: Table.FieldBehavior[] = c.fieldBehavior || ["read", "write"];
      return includes(fieldBehavior, "read");
    });
    const tableData = tabling.util.createTableData<Table.Column<R, M>, R, M>(readColumns, data, {
      defaultNullValue: null,
      // ordering,
      getRowMeta: (m: M) => ({
        label: !isNil(getRowLabel) ? getRowLabel(m) : m.id,
        gridId: "data"
      })
    });
    setTable(map(tableData, (dt: Table.ModelWithRow<R, M>) => dt.row));
  }, [hooks.useDeepEqualMemo(data)]);

  return <DataGrid<R, M> {...props} data={table} />;
};

export default ModelDataGrid;
