import { useRef, ReactNode } from "react";
import classNames from "classnames";
import { isNil, map, filter } from "lodash";

import { faTrashAlt, faFileCsv } from "@fortawesome/pro-regular-svg-icons";

import { CellClassParams, SuppressKeyboardEventParams } from "@ag-grid-community/core";

import * as models from "lib/model";

import { FieldsDropdown } from "components/dropdowns";

import { getKeyValue } from "lib/util";
import { downloadAsCsvFile } from "lib/util/files";
import { findChoiceForName } from "lib/model/util";
import { percentageToDecimalValueSetter } from "lib/model/valueSetters";
import { agPercentageValueFormatter } from "lib/model/formatters";
import BudgetTableComponent from "../BudgetTable";

export interface GenericFringesTableProps
  extends Omit<
    BudgetTable.Props<BudgetTable.FringeRow, Model.Fringe, Http.FringePayload>,
    "manager" | "columns" | "tableRef"
  > {
  exportFileName: string;
  saving: boolean;
  search: string;
  data: Model.Fringe[];
  onRowExpand?: (id: number) => void;
  onSearch: (value: string) => void;
}

const GenericFringesTable: React.FC<GenericFringesTableProps> = (props): JSX.Element => {
  const tableRef = useRef<BudgetTable.Ref<BudgetTable.FringeRow, Model.Fringe>>(null);

  return (
    <BudgetTableComponent<BudgetTable.FringeRow, Model.Fringe, Http.FringePayload>
      className={"fringes-table"}
      tableRef={tableRef}
      detached={true}
      indexColumn={{ width: 40, maxWidth: 50 }}
      getModelLabel={(model: Model.Fringe) => model.name}
      cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
      actions={(params: BudgetTable.MenuActionParams<BudgetTable.FringeRow, Model.Fringe>) => [
        {
          tooltip: "Delete",
          icon: faTrashAlt,
          onClick: () => {
            const rows: BudgetTable.FringeRow[] = params.apis.grid.getSelectedRows();
            props.onChangeEvent({
              type: "rowDelete",
              payload: { rows, columns: params.columns }
            });
          }
        },
        {
          text: "Export CSV",
          icon: faFileCsv,
          tooltip: "Export as CSV",
          wrap: (children: ReactNode) => {
            return (
              <FieldsDropdown
                fields={map(params.columns, (col: Table.Column<BudgetTable.FringeRow, Model.Fringe>) => ({
                  id: col.field as string,
                  label: col.headerName as string,
                  defaultChecked: true
                }))}
                buttons={[
                  {
                    onClick: (checks: FieldCheck[]) => {
                      const tableRefObj = tableRef.current;
                      const fields = map(
                        filter(checks, (field: FieldCheck) => field.checked === true),
                        (field: FieldCheck) => field.id
                      );
                      if (fields.length !== 0 && !isNil(tableRefObj)) {
                        const csvData = tableRefObj.getCSVData(fields);
                        downloadAsCsvFile(props.exportFileName, csvData);
                      }
                    },
                    text: "Download",
                    className: "btn btn--primary"
                  }
                ]}
              >
                {children}
              </FieldsDropdown>
            );
          }
        }
      ]}
      columns={[
        {
          field: "name",
          columnType: "text",
          headerName: "Name",
          width: 120
        },
        {
          field: "color",
          headerName: "Color",
          cellClass: classNames("cell--centered"),
          cellRenderer: "ColorCell",
          cellEditor: "FringesColorEditor",
          width: 100,
          columnType: "singleSelect"
        },
        {
          field: "description",
          headerName: "Description",
          columnType: "longText",
          flex: 100
        },
        {
          field: "rate",
          headerName: "Rate",
          valueFormatter: agPercentageValueFormatter,
          valueSetter: percentageToDecimalValueSetter<BudgetTable.FringeRow>("rate"),
          columnType: "percentage",
          isCalculating: true,
          width: 100
        },
        {
          field: "unit",
          headerName: "Unit",
          cellClass: classNames("cell--centered"),
          cellRenderer: "FringeUnitCell",
          width: 100,
          cellEditor: "FringeUnitCellEditor",
          columnType: "singleSelect",
          getHttpValue: (value: Model.FringeUnit | null): number | null => (!isNil(value) ? value.id : null),
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: BudgetTable.FringeRow) => {
            const unit = getKeyValue<BudgetTable.FringeRow, keyof BudgetTable.FringeRow>("unit")(row);
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
          columnType: "number",
          isCalculating: true,
          width: 100
        }
      ]}
      {...props}
    />
  );
};

export default GenericFringesTable;
