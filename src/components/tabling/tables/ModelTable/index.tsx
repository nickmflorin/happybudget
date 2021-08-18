import classNames from "classnames";
import { Table, TableProps, DataGridProps } from "components/tabling/generic";
import ModelDataGrid from "./DataGrid";

export interface ModelTableProps<R extends Table.Row, M extends Model.Model> extends Omit<TableProps<R, M>, "data"> {
  readonly data: M[];
  readonly getRowLabel?: (m: M) => number | string | null;
}

const ModelTable = <R extends BudgetTable.Row, M extends Model.Model>({ data, ...props }: ModelTableProps<R, M>) => {
  return (
    <Table
      {...props}
      className={classNames("model-table", props.className)}
      renderDataGrid={(params: DataGridProps<R, M>) => <ModelDataGrid<R, M> {...params} data={data} />}
    />
  );
};

export default ModelTable;
