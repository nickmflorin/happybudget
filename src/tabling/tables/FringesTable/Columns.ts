import { isNil } from "lodash";
import { ValueSetterParams } from "@ag-grid-community/core";

import { model, tabling, formatters } from "lib";

import { columns } from "../../generic";

type R = Tables.FringeRowData;
type M = Model.Fringe;

const Columns: Table.Column<R, M>[] = [
  columns.BodyColumn<R, M>({
    field: "name",
    nullValue: null,
    dataType: "text",
    headerName: "Name",
    width: 120,
  }),
  columns.BodyColumn<R, M>({
    field: "color",
    nullValue: null,
    headerName: "Color",
    cellClass: "cell--renders-html",
    cellRenderer: { data: "ColorCell" },
    cellEditor: "FringesColorEditor",
    width: 100,
    dataType: "singleSelect",
    cellEditorPopup: true,
    cellEditorPopupPosition: "below",
  }),
  columns.BodyColumn<R, M>({
    field: "description",
    nullValue: null,
    headerName: "Description",
    dataType: "longText",
    flex: 100,
  }),
  columns.BodyColumn<R, M>({
    field: "rate",
    headerName: "Rate",
    nullValue: null,
    dataType: "percentage",
    width: 100,
    valueSetter: (params: ValueSetterParams) => {
      const row: Table.BodyRow<R> = params.data;
      if (!isNil(row) && tabling.rows.isModelRow(row)) {
        const unit = row.data.unit === null ? model.budgeting.FringeUnits.percent : row.data.unit;
        return unit.id === model.budgeting.FringeUnits.flat.id
          ? tabling.columns.numericValueSetter("rate")(params)
          : tabling.columns.percentageToDecimalValueSetter("rate")(params);
      }
      /* Here, we have to assume that the value should be formatted as a
         percentage. */
      return tabling.columns.percentageToDecimalValueSetter("rate")(params);
    },
    valueFormatter: (params: AGFormatterParams) => {
      if (formatters.isAgFormatterParams(params)) {
        const row: Table.BodyRow<R> = params.data;
        if (!isNil(row) && tabling.rows.isModelRow(row)) {
          // The default Fringe Unit in the backend is PERCENT.
          const unit = row.data.unit === null ? model.budgeting.FringeUnits.percent : row.data.unit;
          return unit.id === model.budgeting.FringeUnits.flat.id
            ? formatters.currencyFormatter((v: string | number) =>
                console.error(`Could not parse currency value ${String(v)} for field 'rate'.`),
              )(params)
            : formatters.percentageFormatter((v: string | number) =>
                console.error(`Could not parse percentage value ${String(v)} for field 'rate'.`),
              )(params);
        }
        /* Here, we have to assume that the value should be formatted as a
           percentage. */
        return formatters.percentageFormatter((v: string | number) =>
          console.error(`Could not parse percentage value ${String(v)} for field 'rate'.`),
        )(params);
      } else {
        /* The only time the params would be native formatter params would be if
				   this column was being used in a PDF - which it isn't, so this is safe
				   for now. */
        return formatters.percentageFormatter((v: string | number) =>
          console.error(`Could not parse percentage value ${String(v)} for field 'rate'.`),
        )(params);
      }
    },
  }),
  columns.ChoiceSelectColumn<R, M, Model.FringeUnit | null>({
    field: "unit",
    nullValue: null,
    headerName: "Unit",
    cellRenderer: { data: "FringeUnitCell" },
    cellEditor: "FringeUnitEditor",
    processCellFromClipboard: (name: string) => model.budgeting.FringeUnits.infer(name),
  }),
  columns.BodyColumn<R, M>({
    nullValue: null,
    field: "cutoff",
    headerName: "Cutoff",
    dataType: "number",
    width: 100,
  }),
];

export default Columns;
