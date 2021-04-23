import classNames from "classnames";

import { CellClassParams } from "ag-grid-community";

import { FringeUnits } from "lib/model";
import { FringeRowManager } from "lib/tabling/managers";
import { percentageToDecimalValueSetter, choiceModelValueSetter } from "lib/tabling/valueSetters";
import { percentageValueFormatter } from "lib/tabling/formatters";
import BudgetTable, { BudgetTableProps } from "./BudgetTable";

type PassThroughProps =
  | "saving"
  | "search"
  | "selected"
  | "placeholders"
  | "data"
  | "onRowSelect"
  | "onRowDeselect"
  | "onRowUpdate"
  | "onRowBulkUpdate"
  | "onRowAdd"
  | "onRowDelete"
  | "onRowExpand"
  | "onSelectAll"
  | "onSearch";

interface FringesBudgetTableProps
  extends Pick<BudgetTableProps<Table.FringeRow, Model.Fringe, Model.Group, Http.FringePayload>, PassThroughProps> {
  saving: boolean;
  search: string;
  selected: number[];
  placeholders: Table.FringeRow[];
  data: Model.Fringe[];
  onRowSelect: (id: number) => void;
  onRowDeselect: (id: number) => void;
  onRowUpdate: (payload: Table.RowChange<Table.FringeRow>) => void;
  onRowBulkUpdate?: (payload: Table.RowChange<Table.FringeRow>[]) => void;
  onRowAdd: () => void;
  onRowDelete: (row: Table.FringeRow) => void;
  onRowExpand?: (id: number) => void;
  onSelectAll: () => void;
  onSearch: (value: string) => void;
}

const FringesBudgetTable: React.FC<FringesBudgetTableProps> = ({ ...props }): JSX.Element => {
  return (
    <BudgetTable<Table.FringeRow, Model.Fringe, Model.Group, Http.FringePayload>
      manager={FringeRowManager}
      identifierField={"name"}
      identifierFieldHeader={"Name"}
      tableFooterIdentifierValue={null}
      indexColumn={{ width: 40, maxWidth: 50 }}
      cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
      bodyColumns={[
        {
          field: "description",
          headerName: "Description"
        },
        {
          field: "rate",
          headerName: "Rate",
          valueFormatter: percentageValueFormatter,
          valueSetter: percentageToDecimalValueSetter<Table.FringeRow>("rate")
        },
        {
          field: "unit",
          headerName: "Unit",
          cellClass: classNames("cell--centered"),
          cellRenderer: "FringeUnitCell",
          width: 50,
          valueSetter: choiceModelValueSetter<Table.FringeRow, Model.FringeUnit>("unit", FringeUnits, {
            allowNull: false
          })
        },
        {
          field: "cutoff",
          headerName: "Cutoff"
        }
      ]}
      {...props}
    />
  );
};

export default FringesBudgetTable;
