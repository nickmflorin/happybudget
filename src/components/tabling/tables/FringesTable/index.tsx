import classNames from "classnames";
import { isNil } from "lodash";

import { faTrashAlt } from "@fortawesome/pro-regular-svg-icons";
import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { util, model, tabling } from "lib";
import { ModelTable, ModelTableProps } from "components/tabling";
import { framework } from "components/tabling/generic";

import Framework from "./framework";

type R = Tables.FringeRow;
type M = Model.Fringe;

type OmitTableProps = "columns" | "getModelLabel" | "actions";

export interface FringesTableProps extends Omit<ModelTableProps<R, M>, OmitTableProps> {
  readonly exportFileName: string;
}

const FringesTable: React.FC<FringesTableProps> = ({ exportFileName, ...props }): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined(props.table);

  return (
    <ModelTable<R, M>
      {...props}
      table={table}
      framework={tabling.util.combineFrameworks(Framework, props.framework)}
      className={classNames("fringes-table", props.className)}
      getModelLabel={(m: M) => m.name}
      actions={(params: Table.MenuActionParams<R, M>) => [
        {
          icon: faTrashAlt,
          disabled: params.selectedRows.length === 0,
          onClick: () => {
            const rows: R[] = params.apis.grid.getSelectedRows();
            props.onChangeEvent?.({
              type: "rowDelete",
              payload: { rows, columns: params.columns }
            });
          }
        },
        framework.actions.ExportCSVAction(table.current, params, exportFileName)
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
          cellClass: "cell--renders-html",
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
          valueFormatter: tabling.formatters.agPercentageValueFormatter,
          valueSetter: tabling.valueSetters.percentageToDecimalValueSetter<R>("rate"),
          columnType: "percentage",
          isCalculating: true,
          width: 100
        },
        {
          field: "unit",
          headerName: "Unit",
          cellClass: "cell--renders-html",
          cellRenderer: { data: "FringeUnitCell" },
          width: 100,
          cellEditor: "FringeUnitEditor",
          columnType: "singleSelect",
          getHttpValue: (value: Model.FringeUnit | null): number | null => (!isNil(value) ? value.id : null),
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: R) => {
            const unit = util.getKeyValue<R, keyof R>("unit")(row);
            if (isNil(unit)) {
              return "";
            }
            return unit.name;
          },
          processCellFromClipboard: (name: string) => {
            if (name.trim() === "") {
              return null;
            }
            const unit = model.util.findChoiceForName<Model.FringeUnit>(model.models.FringeUnits, name);
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
    />
  );
};

export default FringesTable;
