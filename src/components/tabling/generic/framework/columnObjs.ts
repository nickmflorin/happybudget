import { tabling } from "lib";

export const ActionColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>
): Partial<Table.Column<R, M>> => ({
  /* eslint-disable indent */
  ...col,
  selectable: false,
  columnType: "action",
  fieldBehavior: [],
  headerName: "",
  editable: false,
  resizable: false,
  cellClass: "cell--action",
  canBeHidden: false,
  canBeExported: false
});

export const ExpandColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: "ExpandCell",
    ...col,
    width: 30,
    maxWidth: 30,
    field: "expand" as keyof M & keyof R & string
  }) as Table.Column<R, M>;

export const IndexColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>,
  hasExpandColumn: boolean
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: "EmptyCell",
    ...col,
    field: "index" as keyof M & keyof R & string,
    width: hasExpandColumn === false ? 40 : 25,
    maxWidth: hasExpandColumn === false ? 40 : 25
  }) as Table.Column<R, M>;

export const CalculatedColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>
): Table.Column<R, M> => {
  return {
    ...col,
    cellStyle: { textAlign: "right", ...col.cellStyle },
    cellRenderer: "CalculatedCell",
    suppressSizeToFit: true,
    width: 100,
    maxWidth: 100,
    valueFormatter: tabling.formatters.agCurrencyValueFormatter,
    cellRendererParams: {
      ...col.cellRendererParams,
      renderRedIfNegative: true
    }
  } as Table.Column<R, M>;
};
