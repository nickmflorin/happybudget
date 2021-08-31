import React from "react";
import { findIndex } from "lodash";

import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil, map, filter, includes } from "lodash";
import { Column } from "@ag-grid-community/core";

import { tabling, model } from "lib";
import { framework } from "components/tabling/generic";
import { framework as budgetFramework } from "../BudgetTable";
import { Framework } from "./framework";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;

export type SubAccountsTableProps = {
  readonly budget?: Model.Budget | Model.Template;
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
  readonly tableFooterIdentifierValue: string;
  readonly subAccountUnits: Model.Tag[];
  readonly fringes: Model.Fringe[];
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
};

export type WithSubAccountsTableProps<T extends SubAccountsTableProps> = T & SubAccountsTableInnerProps;

type SubAccountsTableInnerProps = {
  readonly columns: Table.Column<R, M>[];
  readonly getRowChildren: (m: M) => number[];
};

function SubAccountsTable<T extends SubAccountsTableProps>(
  Component:
    | React.ComponentClass<WithSubAccountsTableProps<T>, {}>
    | React.FunctionComponent<WithSubAccountsTableProps<T>>
): React.ComponentClass<T> {
  class WithSubAccountsTable extends React.Component<T, {}> {
    displayName = `SubAccountsTable(${Component.displayName})`;

    render() {
      return (
        <Component
          {...this.props}
          getRowChildren={(m: M) => m.subaccounts}
          showPageFooter={true}
          getRowName={"Sub Account"}
          getRowLabel={(m: M) => m.identifier || m.description}
          cookieNames={{ ...this.props.cookieNames, hiddenColumns: "subaccount-table-hidden-columns" }}
          framework={Framework}
          columns={[
            budgetFramework.columnObjs.IdentifierColumn({
              field: "identifier",
              tableFooterLabel: this.props.tableFooterIdentifierValue,
              pageFooterLabel: !isNil(this.props.budget) ? `${this.props.budget.name} Total` : "Budget Total",
              headerName: this.props.identifierFieldHeader
            }),
            framework.columnObjs.BodyColumn({
              field: "description",
              headerName: `${this.props.categoryName} Description`,
              columnType: "longText",
              index: 1,
              suppressSizeToFit: false,
              colSpan: (params: Table.ColSpanParams<R, M>) => {
                const row: R = params.data;
                if (!isNil(row.meta) && !isNil(row.meta.children) && row.meta.children.length !== 0) {
                  const agColumns: Column[] | undefined = params.columnApi?.getAllDisplayedColumns();
                  if (!isNil(agColumns)) {
                    const originalCalculatedColumns = map(
                      filter(params.columns, (col: Table.Column<R, M>) => col.tableColumnType === "calculated"),
                      (col: Table.Column<R, M>) => col.field
                    );
                    const indexOfDescriptionColumn = findIndex(
                      agColumns,
                      (col: Column) => col.getColId() === "description"
                    );
                    const indexOfFirstCalculatedColumn = findIndex(agColumns, (col: Column) =>
                      includes(originalCalculatedColumns, col.getColId())
                    );
                    return indexOfFirstCalculatedColumn - indexOfDescriptionColumn;
                  }
                }
                return 1;
              }
            }),
            framework.columnObjs.BodyColumn({
              field: "quantity",
              headerName: "Qty",
              width: 60,
              isCalculating: true,
              valueSetter: tabling.valueSetters.integerValueSetter<R>("quantity"),
              columnType: "number",
              // If the plurality of the quantity changes, we need to refresh the refresh
              // the unit column to change the plurality of the tag in the cell.
              refreshColumns: (change: Table.CellChange<R, M>) => {
                // This shouldn't trigger the callback, but just to be sure.
                if (change.newValue === null && change.oldValue === null) {
                  return [];
                } else if (
                  change.newValue === null ||
                  change.oldValue === null ||
                  (change.newValue > 1 && !(change.oldValue > 1)) ||
                  (change.newValue <= 1 && !(change.oldValue <= 1))
                ) {
                  return ["unit"];
                } else {
                  return [];
                }
              }
            }),
            framework.columnObjs.TagSelectColumn<R, M>({
              field: "unit",
              headerName: "Unit",
              cellRenderer: { data: "SubAccountUnitCell" },
              cellEditor: "SubAccountUnitEditor",
              models: this.props.subAccountUnits,
              width: 140
            }),
            framework.columnObjs.BodyColumn({
              field: "multiplier",
              headerName: "X",
              width: 60,
              isCalculating: true,
              valueSetter: tabling.valueSetters.floatValueSetter<R>("multiplier"),
              columnType: "number"
            }),
            framework.columnObjs.BodyColumn({
              field: "rate",
              headerName: "Rate",
              tableColumnType: "body",
              width: 100,
              isCalculating: true,
              valueFormatter: tabling.formatters.agCurrencyValueFormatter,
              valueSetter: tabling.valueSetters.floatValueSetter<R>("rate"),
              columnType: "currency"
            }),
            framework.columnObjs.SelectColumn({
              field: "fringes",
              headerName: "Fringes",
              isCalculating: true,
              cellRenderer: { data: "FringesCell" },
              width: 200,
              nullValue: [],
              getRowValue: (m: M): Model.Fringe[] => model.util.getModelsByIds(this.props.fringes, m.fringes),
              getModelValue: (row: R): number[] => map(row.fringes, (f: Model.Fringe) => f.id),
              processCellForClipboard: (row: R) => {
                return map(row.fringes, (fringe: Model.Fringe) => fringe.name).join(", ");
              }
            })
          ]}
        />
      );
    }
  }
  return hoistNonReactStatics(WithSubAccountsTable, Component);
}

export default SubAccountsTable;
