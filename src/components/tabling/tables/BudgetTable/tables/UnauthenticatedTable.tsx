import {
  UnauthenticatedTable,
  UnauthenticatedTableProps,
  UnauthenticatedTableDataGridProps
} from "components/tabling/generic";

import { UnauthenticatedBudgetDataGrid } from "../grids";

export type UnauthenticatedBudgetTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Omit<UnauthenticatedTableProps<R, M>, "children"> & {
  readonly onBack?: () => void;
};

/* eslint-disable indent */
const UnauthenticatedBudgetTable = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: UnauthenticatedBudgetTableProps<R, M>
): JSX.Element => {
  return (
    <UnauthenticatedTable<R, M> {...props}>
      {(params: UnauthenticatedTableDataGridProps<R, M>) => (
        <UnauthenticatedBudgetDataGrid<R, M>
          {...params}
          onBack={props.onBack}
          rowCanExpand={props.rowCanExpand}
          onRowExpand={props.onRowExpand}
        />
      )}
    </UnauthenticatedTable>
  );
};

export default UnauthenticatedBudgetTable;
