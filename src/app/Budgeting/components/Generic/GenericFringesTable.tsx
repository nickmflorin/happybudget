import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/pro-solid-svg-icons";

import { CellClassParams } from "@ag-grid-community/core";

import { FringeUnits } from "lib/model";
import { FringeRowManager } from "lib/tabling/managers";
import { percentageToDecimalValueSetter, choiceModelValueSetter } from "lib/tabling/valueSetters";
import { percentageValueFormatter } from "lib/tabling/formatters";
import BudgetTable, { BudgetTableProps, BudgetTableActionsParams } from "../BudgetTable";

export interface GenericFringesTableProps
  extends Omit<
    BudgetTableProps<Table.FringeRow, Model.Fringe, Model.Group, Http.FringePayload>,
    "manager" | "identifierField" | "identifierFieldHeader" | "bodyColumns"
  > {
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

const GenericFringesTable: React.FC<GenericFringesTableProps> = ({ ...props }): JSX.Element => {
  return (
    <BudgetTable<Table.FringeRow, Model.Fringe, Model.Group, Http.FringePayload>
      className={"fringes-table"}
      detached={true}
      manager={FringeRowManager}
      identifierField={"name"}
      identifierFieldHeader={"Name"}
      tableFooterIdentifierValue={null}
      canExport={false}
      canToggleColumns={false}
      indexColumn={{ width: 40, maxWidth: 50 }}
      cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
      actions={(params: BudgetTableActionsParams<Table.FringeRow, Model.Group>) => [
        {
          tooltip: "Delete",
          icon: <FontAwesomeIcon icon={faTrashAlt} />,
          disabled: params.selectedRows.length === 0,
          onClick: params.onDelete
        }
      ]}
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
          width: 100,
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

export default GenericFringesTable;
