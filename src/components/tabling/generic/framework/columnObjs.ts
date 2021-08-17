import { isNil } from "lodash";
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
  cellClass: tabling.util.mergeClassNamesFn("cell--centered", "cell--action", col.cellClass),
  canBeHidden: false,
  canBeExported: false
});

export const ExpandColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: "ExpandCell",
    ...col,
    width: !isNil(width) ? width : 30,
    maxWidth: !isNil(width) ? width : 30,
    field: "expand" as keyof M & keyof R & string
  }) as Table.Column<R, M>;

export const IndexColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>,
  hasExpandColumn: boolean,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: "EmptyCell",
    ...col,
    field: "index" as keyof M & keyof R & string,
    width: !isNil(width) ? width : hasExpandColumn === false ? 40 : 25,
    maxWidth: !isNil(width) ? width : hasExpandColumn === false ? 40 : 25
  }) as Table.Column<R, M>;

export const CalculatedColumn = <R extends Table.Row, M extends Model.Model>(
  col: Partial<Table.Column<R, M>>,
  width?: number
): Table.Column<R, M> => {
  return {
    ...col,
    cellStyle: { textAlign: "right", ...col.cellStyle },
    cellRenderer: "CalculatedCell",
    suppressSizeToFit: true,
    width: !isNil(width) ? width : 100,
    maxWidth: !isNil(width) ? width : 100,
    valueFormatter: tabling.formatters.agCurrencyValueFormatter,
    cellRendererParams: {
      ...col.cellRendererParams,
      renderRedIfNegative: true
    }
  } as Table.Column<R, M>;
};
