import { ReadOnlyTable, ReadOnlyTableProps } from "components/tabling/generic";

import { ReadOnlyBudgetDataGrid } from "../grids";

export interface ReadOnlyBudgetTableProps<R extends Table.Row, M extends Model.Model> extends ReadOnlyTableProps<R, M> {
  readonly tableRef?: NonNullRef<Table.ReadOnlyTableRefObj<R, M>>;
  readonly models: M[];
  readonly groups: Model.Group[];
  readonly levelType: BudgetTable.LevelType;
  readonly budgetType: Model.BudgetType;
  readonly getRowChildren: (m: M) => number[];
  readonly onBack?: () => void;
}

const ReadOnlyBudgetTable = <R extends Table.Row, M extends Model.Model>(
  props: ReadOnlyBudgetTableProps<R, M>
): JSX.Element => {
  return (
    <ReadOnlyTable<R, M> {...props}>
      {(params: TableUi.ReadOnlyDataGridRenderParams<R, M>) => <ReadOnlyBudgetDataGrid {...props} {...params} />}
    </ReadOnlyTable>
  );
};

export default ReadOnlyBudgetTable;
