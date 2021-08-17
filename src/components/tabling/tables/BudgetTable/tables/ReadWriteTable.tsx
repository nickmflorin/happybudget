import { ReadWriteTable, ReadWriteTableProps } from "components/tabling/generic";

import { ReadWriteBudgetDataGrid } from "../grids";

export interface ReadWriteBudgetTableProps<R extends BudgetTable.Row, M extends Model.Model>
  extends ReadWriteTableProps<R, M> {
  readonly tableRef?: NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>>;
  readonly models: M[];
  readonly groups: Model.Group[];
  readonly levelType: BudgetTable.LevelType;
  readonly budgetType: Model.BudgetType;
  readonly getRowChildren: (m: M) => number[];
  readonly onBack?: () => void;
  readonly onEditGroup: (g: Model.Group) => void;
  readonly onGroupRows: (rows: R[]) => void;
}

const ReadWriteBudgetTable = <R extends BudgetTable.Row, M extends Model.Model>(
  props: ReadWriteBudgetTableProps<R, M>
): JSX.Element => {
  return (
    <ReadWriteTable<R, M> rowHasCheckboxSelection={(row: BudgetTable.Row) => row.meta.isGroupRow !== true} {...props}>
      {(params: TableUi.ReadWriteDataGridRenderParams<R, M>) => {
        return <ReadWriteBudgetDataGrid {...props} {...params} />;
      }}
    </ReadWriteTable>
  );
};

export default ReadWriteBudgetTable;
