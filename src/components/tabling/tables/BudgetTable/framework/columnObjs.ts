import { isNil, filter, map, findIndex, includes, reduce } from "lodash";
import { ValueGetterParams } from "@ag-grid-community/core";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";

const isSubAccountRowData = (
  data: Tables.AccountRowData | Tables.SubAccountRowData
): data is Tables.SubAccountRowData => (data as Tables.SubAccountRowData).fringe_contribution !== undefined;

export const IdentifierColumn = <R extends Tables.BudgetRowData, M extends Model.HttpModel>(
  props: Partial<Table.Column<R, M>>
): Table.Column<R, M> => {
  return framework.columnObjs.BodyColumn<R, M>({
    field: "identifier",
    columnType: "number",
    ...props,
    footer: {
      // We always want the text in the identifier cell to be present, but the column
      // itself isn't always wide enough.  However, applying a colSpan conflicts with the
      // colSpan of the main data grid, causing weird behavior.
      cellStyle: { zIndex: 1000, overflow: "visible", whiteSpace: "unset", textAlign: "left" }
    },
    page: {
      // We always want the text in the identifier cell to be present, but the column
      // itself isn't always wide enough.  However, applying a colSpan conflicts with the
      // colSpan of the main data grid, causing weird behavior.
      cellStyle: { zIndex: 1000, overflow: "visible", whiteSpace: "unset", textAlign: "left" }
    },
    index: 0,
    cellRenderer: { data: "IdentifierCell", footer: "IdentifierCell", page: "IdentifierCell" },
    width: 100,
    suppressSizeToFit: true,
    cellStyle: { textAlign: "left" },
    valueGetter: (params: ValueGetterParams) => {
      if (!isNil(params.node)) {
        const row: Table.Row<R> = params.node.data;
        // If the row is a FooterRow, the value will be provided via footerRowSelectors.
        if (tabling.typeguards.isBodyRow(row)) {
          if (tabling.typeguards.isGroupRow(row)) {
            return row.groupData.name;
          }
          return row.data.identifier;
        }
      }
      return 0.0;
    },
    colSpan: (params: Table.ColSpanParams<R, M>) => {
      const row: Table.BodyRow<R> = params.data;
      if (tabling.typeguards.isGroupRow(row)) {
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
            includes(originalCalculatedColumns, c.getColId() as keyof R)
          );
          return indexOfFirstCalculatedColumn - indexOfIdentifierColumn;
        }
      }
      return 1;
    }
  });
};

export const EstimatedColumn = <R extends Tables.BudgetRowData, M extends Model.HttpModel>(
  props: Partial<Table.Column<R, M>>
): Table.Column<R, M> => {
  return framework.columnObjs.CalculatedColumn<R, M>({
    ...props,
    colId: "estimated",
    headerName: "Estimated",
    valueGetter: (params: ValueGetterParams) => {
      if (!isNil(params.node)) {
        const row: Table.Row<R> = params.node.data;
        // If the row is a FooterRow, the value will be provided via footerRowSelectors.
        if (tabling.typeguards.isBodyRow(row)) {
          if (tabling.typeguards.isDataRow(row)) {
            if (isSubAccountRowData(row.data)) {
              return row.data.nominal_value + row.data.accumulated_markup_contribution + row.data.fringe_contribution;
            }
            return row.data.nominal_value + row.data.accumulated_markup_contribution;
          } else {
            // Note: We do not have to exclude row's by ID because the primary Row here
            // is already a MarkupRow and we are only looking at the BodyRow(s).
            const childrenRows: Table.ModelRow<R>[] = filter(
              tabling.aggrid.getRows<R, Table.BodyRow<R>>(params.api),
              (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r) && includes(row.children, r.id)
            ) as Table.ModelRow<R>[];
            if (tabling.typeguards.isMarkupRow(row)) {
              return reduce(
                childrenRows,
                (curr: number, r: Table.ModelRow<R>) => curr + r.data.markup_contribution,
                0.0
              );
            } else {
              return reduce(
                childrenRows,
                (curr: number, r: Table.ModelRow<R>) =>
                  curr +
                  (isSubAccountRowData(row.data)
                    ? row.data.nominal_value + row.data.fringe_contribution + row.data.markup_contribution
                    : row.data.nominal_value + row.data.accumulated_markup_contribution + row.data.markup_contribution),
                0.0
              );
            }
          }
        }
      }
      return 0.0;
    }
  });
};

export const ActualColumn = <R extends Tables.BudgetRowData, M extends Model.HttpModel>(
  props: Partial<Table.Column<R, M>>
): Table.Column<R, M> => {
  return framework.columnObjs.CalculatedColumn<R, M>({
    ...props,
    field: "actual",
    headerName: "Actual",
    valueGetter: (params: ValueGetterParams) => {
      if (!isNil(params.node)) {
        const row: Table.Row<R> = params.node.data;
        // If the row is a FooterRow, the value will be provided via footerRowSelectors.
        if (tabling.typeguards.isBodyRow(row)) {
          if (tabling.typeguards.isDataRow(row) || tabling.typeguards.isMarkupRow(row)) {
            return row.data.actual;
          } else {
            // Note: We do not have to exclude row's by ID because the primary Row here
            // is already a MarkupRow and we are only looking at the BodyRow(s).
            const childrenRows: Table.ModelRow<R>[] = filter(
              tabling.aggrid.getRows<R, Table.BodyRow<R>>(params.api),
              (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r) && includes(row.children, r.id)
            ) as Table.ModelRow<R>[];
            return reduce(childrenRows, (curr: number, r: Table.ModelRow<R>) => curr + r.data.actual, 0.0);
          }
        }
      }
      return 0.0;
    }
  });
};

export const VarianceColumn = <R extends Tables.BudgetRowData, M extends Model.HttpModel>(
  props: Partial<Table.Column<R, M>>
): Table.Column<R, M> => {
  return framework.columnObjs.CalculatedColumn<R, M>({
    ...props,
    colId: "variance",
    headerName: "Variance",
    valueGetter: (params: ValueGetterParams) => {
      if (!isNil(params.node)) {
        const row: Table.Row<R> = params.node.data;
        // If the row is a FooterRow, the value will be provided via footerRowSelectors.
        if (tabling.typeguards.isBodyRow(row)) {
          if (isSubAccountRowData(row.data)) {
            return (
              row.data.nominal_value +
              row.data.accumulated_markup_contribution +
              row.data.fringe_contribution -
              row.data.actual
            );
          }
          return row.data.nominal_value + row.data.accumulated_markup_contribution - row.data.actual;
        }
      }
      return 0.0;
    }
  });
};
