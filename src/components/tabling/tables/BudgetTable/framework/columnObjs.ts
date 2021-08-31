import { isNil, filter, map, findIndex, includes } from "lodash";

import { framework } from "components/tabling/generic";

type IdentifierColumnProps<R extends BudgetTable.Row, M extends Model.Model> = Partial<Table.Column<R, M>> & {
  readonly tableFooterLabel: string;
  readonly pageFooterLabel?: string;
};

export const IdentifierColumn = <R extends BudgetTable.Row, M extends Model.Model>(
  props: IdentifierColumnProps<R, M>
): Table.Column<R, M> => {
  const { tableFooterLabel, pageFooterLabel, ...col } = props;
  const base = framework.columnObjs.BodyColumn({
    columnType: "number",
    ...col,
    footer: {
      value: tableFooterLabel,
      // We always want the text in the identifier cell to be present, but the column
      // itself isn't always wide enough.  However, applying a colSpan conflicts with the
      // colSpan of the main data grid, causing weird behavior.
      cellStyle: { zIndex: 1000, overflow: "visible", whiteSpace: "unset", textAlign: "left" }
    },
    index: 0,
    cellRenderer: { data: "IdentifierCell" },
    width: 100,
    suppressSizeToFit: true,
    cellStyle: { textAlign: "left" },
    colSpan: (params: Table.ColSpanParams<R, M>) => {
      const row: R = params.data;
      if (row.meta.isGroupRow === true) {
        /*
        Note: We have to look at all of the visible columns that are present up until
        the calculated columns.  This means we have to use the AG Grid ColumnApi (not our
        own columns).
        */
        const agColumns: Table.AgColumn[] | undefined = params.columnApi?.getAllDisplayedColumns();
        if (!isNil(agColumns)) {
          const originalCalculatedColumns = map(
            filter(params.columns, (c: Table.Column<R, M>) => c.tableColumnType === "calculated"),
            (c: Table.Column<R, M>) => c.field
          );
          const indexOfIdentifierColumn = findIndex(agColumns, (c: Table.AgColumn) => c.getColId() === "identifier");
          const indexOfFirstCalculatedColumn = findIndex(agColumns, (c: Table.AgColumn) =>
            includes(originalCalculatedColumns, c.getColId())
          );
          return indexOfFirstCalculatedColumn - indexOfIdentifierColumn;
        }
      }
      return 1;
    }
  });
  if (!isNil(props.pageFooterLabel)) {
    return {
      ...base,
      page: {
        ...col.page,
        value: props.pageFooterLabel,
        // We always want the text in the identifier cell to be present, but the column
        // itself isn't always wide enough.  However, applying a colSpan conflicts with the
        // colSpan of the main data grid, causing weird behavior.
        cellStyle: { zIndex: 1000, overflow: "visible", whiteSpace: "unset", textAlign: "left" }
      }
    };
  }
  return base;
};
