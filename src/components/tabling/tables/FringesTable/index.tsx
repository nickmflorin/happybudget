import classNames from "classnames";

import { faTrashAlt } from "@fortawesome/pro-regular-svg-icons";

import { model, tabling } from "lib";
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
          cellRenderer: { data: "ColorCell" },
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
        framework.columnObjs.ChoiceSelectColumn<R, M, Model.FringeUnit>({
          field: "unit",
          headerName: "Unit",
          cellRenderer: { data: "FringeUnitCell" },
          cellEditor: "FringeUnitEditor",
          models: model.models.FringeUnits
        }),
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
