import { isNil } from "lodash";
import { ValueSetterParams } from "@ag-grid-community/core";

import { models, budgeting, tabling } from "lib";
import { columns } from "../../generic";

type R = Tables.FringeRowData;
type M = Model.Fringe;

const Columns: Table.Column<R, M>[] = [
  columns.BodyColumn<R, M>({
    field: "name",
    columnType: "text",
    headerName: "Name",
    width: 120
  }),
  columns.BodyColumn<R, M>({
    field: "color",
    headerName: "Color",
    cellClass: "cell--renders-html",
    cellRenderer: { data: "ColorCell" },
    cellEditor: "FringesColorEditor",
    width: 100,
    columnType: "singleSelect",
    cellEditorPopup: true,
    cellEditorPopupPosition: "below"
  }),
  columns.BodyColumn<R, M>({
    field: "description",
    headerName: "Description",
    columnType: "longText",
    flex: 100
  }),
  columns.BodyColumn<R, M>({
    field: "rate",
    headerName: "Rate",
    columnType: "percentage",
    width: 100,
    valueSetter: (params: ValueSetterParams) => {
      const row: Table.BodyRow<R> = params.data;
      if (!isNil(row) && tabling.typeguards.isModelRow(row)) {
        const unit = row.data.unit === null ? budgeting.models.FringeUnitModels.PERCENT : row.data.unit;
        return unit.id === budgeting.models.FringeUnitModels.FLAT.id
          ? tabling.valueSetters.numericValueSetter<R>("rate")(params)
          : tabling.valueSetters.percentageToDecimalValueSetter<R>("rate")(params);
      }
      /* Here, we have to assume that the value should be formatted as a
         percentage. */
      return tabling.valueSetters.percentageToDecimalValueSetter<R>("rate")(params);
    },
    valueFormatter: (params: Table.AGFormatterParams) => {
      if (tabling.formatters.isAgFormatterParams(params)) {
        const row: Table.BodyRow<R> = params.data;
        if (!isNil(row) && tabling.typeguards.isModelRow(row)) {
          // The default Fringe Unit in the backend is PERCENT.
          const unit = row.data.unit === null ? budgeting.models.FringeUnitModels.PERCENT : row.data.unit;
          return unit.id === budgeting.models.FringeUnitModels.FLAT.id
            ? tabling.formatters.currencyValueFormatter(params)
            : tabling.formatters.percentageValueFormatter(params);
        }
        /* Here, we have to assume that the value should be formatted as a
           percentage. */
        return tabling.formatters.percentageValueFormatter(params);
      } else {
        /* The only time the params would be native formatter params would be if
				   this column was being used in a PDF - which it isn't, so this is safe
				   for now. */
        return tabling.formatters.percentageValueFormatter(params);
      }
    }
  }),
  columns.ChoiceSelectColumn<R, M, Model.FringeUnit>({
    field: "unit",
    headerName: "Unit",
    cellRenderer: { data: "FringeUnitCell" },
    cellEditor: "FringeUnitEditor",
    processCellFromClipboard: (name: string) =>
      models.findChoiceForName<Model.FringeUnit>(budgeting.models.FringeUnits, name)
  }),
  columns.BodyColumn<R, M>({
    field: "cutoff",
    headerName: "Cutoff",
    columnType: "number",
    width: 100
  })
];

export default Columns;
