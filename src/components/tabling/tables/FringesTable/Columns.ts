import { model, tabling } from "lib";

type R = Tables.FringeRowData;
type M = Model.Fringe;

const Columns: Table.Column<R, M>[] = [
  tabling.columns.BodyColumn<R, M>({
    field: "name",
    columnType: "text",
    headerName: "Name",
    width: 120
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "color",
    headerName: "Color",
    cellClass: "cell--renders-html",
    cellRenderer: { data: "ColorCell" },
    cellEditor: "FringesColorEditor",
    width: 100,
    columnType: "singleSelect"
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "description",
    headerName: "Description",
    columnType: "longText",
    flex: 100
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "rate",
    headerName: "Rate",
    valueFormatter: tabling.formatters.percentageValueFormatter,
    valueSetter: tabling.valueSetters.percentageToDecimalValueSetter<R>("rate"),
    columnType: "percentage",
    width: 100
  }),
  tabling.columns.ChoiceSelectColumn<R, M, Model.FringeUnit>({
    field: "unit",
    headerName: "Unit",
    cellRenderer: { data: "FringeUnitCell" },
    cellEditor: "FringeUnitEditor",
    processCellFromClipboard: (name: string) =>
      model.util.findChoiceForName<Model.FringeUnit>(model.models.FringeUnits, name)
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "cutoff",
    headerName: "Cutoff",
    columnType: "number",
    width: 100
  })
];

export default Columns;
