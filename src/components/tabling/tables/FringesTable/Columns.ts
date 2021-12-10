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
    valueFormatter: tabling.formatters.percentageValueFormatter,
    valueSetter: tabling.valueSetters.percentageToDecimalValueSetter<R>("rate"),
    columnType: "percentage",
    width: 100
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
