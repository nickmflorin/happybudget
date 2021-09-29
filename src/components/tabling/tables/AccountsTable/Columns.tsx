import { isNil, reduce } from "lodash";
import { tabling } from "lib";

import { ValueGetterParams } from "@ag-grid-community/core";

import { Icon } from "components";
import { framework } from "components/tabling/generic";
import { framework as budgetFramework } from "../BudgetTable";

type R = Tables.AccountRowData;
type M = Model.Account;

const Columns: Table.Column<R, M>[] = [
  budgetFramework.columnObjs.IdentifierColumn<R, M>({
    field: "identifier",
    headerName: "Account"
  }),
  framework.columnObjs.FakeColumn<R, M>({ field: "fringe_contribution" }),
  framework.columnObjs.FakeColumn<R, M>({ field: "markup_contribution" }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "description",
    headerName: "Account Description",
    getMarkupValue: "description",
    minWidth: 200,
    flex: 100,
    columnType: "longText",
    cellRenderer: "BodyCell",
    cellRendererParams: {
      icon: (row: Table.Row<R, M>) =>
        tabling.typeguards.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    }
  }),
  framework.columnObjs.CalculatedColumn<R, M>({
    field: "estimated",
    headerName: "Estimated",
    getGroupValue: (rows: Table.ModelRow<R, M>[]) => {
      return reduce(
        rows,
        (curr: number, r: Table.ModelRow<R, M>) => curr + r.data.estimated + r.data.fringe_contribution,
        0.0
      );
    },
    getMarkupValue: (rows: Table.ModelRow<R, M>[]) => {
      return reduce(rows, (curr: number, r: Table.ModelRow<R, M>) => curr + r.data.markup_contribution, 0.0);
    }
  }),
  framework.columnObjs.CalculatedColumn<R, M>({
    field: "actual",
    headerName: "Actual",
    getGroupValue: (rows: Table.ModelRow<R, M>[]) => {
      return reduce(rows, (curr: number, r: Table.ModelRow<R, M>) => curr + r.data.actual, 0.0);
    }
  }),
  framework.columnObjs.CalculatedColumn<R, M>({
    colId: "variance",
    headerName: "Variance",
    valueGetter: (params: ValueGetterParams) => {
      if (!isNil(params.node)) {
        const row: Table.Row<R, M> = params.node.data;
        return row.data.estimated + row.data.fringe_contribution - row.data.actual;
      }
      return 0.0;
    }
  })
];

export default Columns;
