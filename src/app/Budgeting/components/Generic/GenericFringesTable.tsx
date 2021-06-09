import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/pro-solid-svg-icons";

import { CellClassParams, SuppressKeyboardEventParams } from "@ag-grid-community/core";

import * as models from "lib/model";

import { getKeyValue } from "lib/util";
import { findChoiceForName } from "lib/model/util";
import { percentageToDecimalValueSetter } from "lib/model/valueSetters";
import { percentageValueFormatter } from "lib/model/formatters";
import BudgetTable from "../BudgetTable";

export interface GenericFringesTableProps
  extends Omit<
    BudgetTable.Props<Table.FringeRow, Model.Fringe, Model.Group, Http.FringePayload>,
    "manager" | "identifierField" | "identifierFieldHeader" | "columns"
  > {
  saving: boolean;
  search: string;
  selected: number[];
  placeholders: Table.FringeRow[];
  data: Model.Fringe[];
  onTableChange: (change: Table.Change<Table.FringeRow>) => void;
  onRowSelect: (id: number) => void;
  onRowDeselect: (id: number) => void;
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
      manager={models.FringeRowManager}
      identifierField={"name"}
      identifierFieldHeader={"Name"}
      tableFooterIdentifierValue={null}
      canExport={false}
      canToggleColumns={false}
      indexColumn={{ width: 40, maxWidth: 50 }}
      cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
      actions={(params: BudgetTable.MenuActionParams<Table.FringeRow, Model.Group>) => [
        {
          tooltip: "Delete",
          icon: <FontAwesomeIcon icon={faTrashAlt} />,
          disabled: params.selectedRows.length === 0,
          onClick: params.onDelete
        }
      ]}
      columns={[
        {
          field: "color",
          headerName: "Color",
          cellClass: classNames("cell--centered"),
          cellRenderer: "ColorCell",
          cellEditor: "FringesColorEditor",
          width: 100,
          type: "singleSelect"
        },
        {
          field: "description",
          headerName: "Description",
          type: "longText"
        },
        {
          field: "rate",
          headerName: "Rate",
          valueFormatter: percentageValueFormatter,
          valueSetter: percentageToDecimalValueSetter<Table.FringeRow>("rate"),
          type: "percentage"
        },
        {
          field: "unit",
          headerName: "Unit",
          cellClass: classNames("cell--centered"),
          cellRenderer: "FringeUnitCell",
          width: 100,
          cellEditor: "FringeUnitCellEditor",
          clearBeforeEdit: true,
          type: "singleSelect",
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: Table.FringeRow) => {
            const unit = getKeyValue<Table.FringeRow, keyof Table.FringeRow>("unit")(row);
            if (isNil(unit)) {
              return "";
            }
            return unit.name;
          },
          processCellFromClipboard: (name: string) => {
            if (name.trim() === "") {
              return null;
            }
            const unit = findChoiceForName<Model.FringeUnit>(models.FringeUnits, name);
            if (!isNil(unit)) {
              return unit;
            }
            return null;
          }
        },
        {
          field: "cutoff",
          headerName: "Cutoff",
          type: "number"
        }
      ]}
      {...props}
    />
  );
};

export default GenericFringesTable;
