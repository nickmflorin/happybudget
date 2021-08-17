import classNames from "classnames";

import { model, tabling } from "lib";

import { framework } from "components/tabling/generic";
import { ReadWriteModelTable, ReadWriteModelTableProps } from "../ModelTable";
import Framework from "./framework";

type R = Tables.FringeRow;
type M = Model.Fringe;

type OmitTableProps = "columns" | "getRowLabel" | "actions";

export interface FringesTableProps extends Omit<ReadWriteModelTableProps<R, M>, OmitTableProps> {
  readonly exportFileName: string;
}

const FringesTable: React.FC<FringesTableProps> = ({ exportFileName, ...props }): JSX.Element => {
  const tableRef = tabling.hooks.useReadWriteTableIfNotDefined<R, M>(props.tableRef);

  return (
    <ReadWriteModelTable<R, M>
      {...props}
      tableRef={tableRef}
      framework={tabling.util.combineFrameworks(Framework, props.framework)}
      className={classNames("fringes-table", props.className)}
      getRowLabel={(m: M) => m.name}
      actions={(params: Table.ReadWriteMenuActionParams<R, M>) => [
        framework.actions.ExportCSVAction<R, M>(tableRef.current, params, exportFileName)
      ]}
      columns={[
        framework.columnObjs.BodyColumn({
          field: "name",
          columnType: "text",
          headerName: "Name",
          width: 120
        }),
        framework.columnObjs.BodyColumn({
          field: "color",
          headerName: "Color",
          cellClass: "cell--renders-html",
          cellRenderer: { data: "ColorCell" },
          cellEditor: "FringesColorEditor",
          width: 100,
          columnType: "singleSelect"
        }),
        framework.columnObjs.BodyColumn({
          field: "description",
          headerName: "Description",
          columnType: "longText",
          flex: 100
        }),
        framework.columnObjs.BodyColumn({
          field: "rate",
          headerName: "Rate",
          valueFormatter: tabling.formatters.agPercentageValueFormatter,
          valueSetter: tabling.valueSetters.percentageToDecimalValueSetter<R>("rate"),
          columnType: "percentage",
          isCalculating: true,
          width: 100
        }),
        framework.columnObjs.ChoiceSelectColumn<R, M, Model.FringeUnit>({
          field: "unit",
          headerName: "Unit",
          cellRenderer: { data: "FringeUnitCell" },
          cellEditor: "FringeUnitEditor",
          models: model.models.FringeUnits
        }),
        framework.columnObjs.BodyColumn({
          field: "cutoff",
          headerName: "Cutoff",
          columnType: "number",
          isCalculating: true,
          width: 100
        })
      ]}
    />
  );
};

export default FringesTable;
