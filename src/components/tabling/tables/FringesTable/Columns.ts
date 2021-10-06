import { model, tabling } from "lib";

import { framework } from "components/tabling/generic";

type R = Tables.FringeRowData;
type M = Model.Fringe;

const Columns: Table.Column<R, M>[] = [
  framework.columnObjs.BodyColumn<R, M>({
    field: "name",
    columnType: "text",
    headerName: "Name",
    width: 120
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "color",
    headerName: "Color",
    cellClass: "cell--renders-html",
    cellRenderer: { data: "ColorCell" },
    cellEditor: "FringesColorEditor",
    width: 100,
    columnType: "singleSelect"
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "description",
    headerName: "Description",
    columnType: "longText",
    flex: 100
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "rate",
    headerName: "Rate",
    valueFormatter: tabling.formatters.percentageValueFormatter,
    valueSetter: tabling.valueSetters.percentageToDecimalValueSetter<R>("rate"),
    columnType: "percentage",
    width: 100
  }),
  framework.columnObjs.ChoiceSelectColumn<R, M, Model.FringeUnit>({
    field: "unit",
    headerName: "Unit",
    cellRenderer: { data: "FringeUnitCell" },
    cellEditor: "FringeUnitEditor",
    models: model.models.FringeUnits
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "cutoff",
    headerName: "Cutoff",
    columnType: "number",
    width: 100
  })
];

export default Columns;
