import { useImperativeHandle } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { tabling } from "lib";

import { Table, TableProps, DataGridProps } from "components/tabling/generic";
import Framework from "./framework";
import BudgetDataGrid from "./DataGrid";

type OmitTableProps = "data" | "rowCanExpand";

export interface BudgetTableProps<R extends BudgetTable.Row, M extends Model.Model>
  extends Omit<TableProps<R, M>, OmitTableProps> {
  readonly table?: BudgetTable.Ref<R, M>;
  readonly levelType: BudgetTable.LevelType;
  readonly budgetType: Model.BudgetType;
  readonly data: M[];
  readonly groups: Model.Group[];
  readonly onGroupRows: (rows: R[]) => void;
  readonly onBack?: () => void;
  readonly getModelChildren: (m: M) => number[];
  readonly getModelLabel?: (m: M) => number | string | null;
}

const BudgetTable = <R extends BudgetTable.Row, M extends Model.Model>({
  table,
  data,
  levelType,
  budgetType,
  groups,
  onGroupRows,
  onBack,
  getModelChildren,
  getModelLabel,
  ...props
}: BudgetTableProps<R, M>) => {
  const genericTable = tabling.hooks.useTable<R, M>();
  const grid = tabling.hooks.useBudgetGrid<R, M>();

  useImperativeHandle(table, () => ({
    changeColumnVisibility: genericTable.current.changeColumnVisibility,
    applyTableChange: (event: Table.ChangeEvent<R, M>) => grid.current.applyTableChange(event),
    getCSVData: (fields?: string[]) => grid.current.getCSVData(fields),
    applyGroupColorChange: (group: Model.Group) => grid.current.applyGroupColorChange(group)
  }));

  return (
    <Table<R, M>
      {...props}
      className={classNames("budget-table", props.className)}
      table={genericTable}
      framework={tabling.util.combineFrameworks(Framework, props.framework)}
      rowCanExpand={(row: R) => !isNil(row.identifier) || (!isNil(row.meta.children) && row.meta.children.length !== 0)}
      renderDataGrid={(params: DataGridProps<R, M>) => (
        <BudgetDataGrid<R, M>
          {...params}
          grid={grid}
          data={data}
          levelType={levelType}
          budgetType={budgetType}
          groups={groups}
          onGroupRows={onGroupRows}
          onBack={onBack}
          getModelChildren={getModelChildren}
        />
      )}
    />
  );
};

export default BudgetTable;
