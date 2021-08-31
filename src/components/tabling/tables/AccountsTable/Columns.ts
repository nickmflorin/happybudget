import { framework } from "components/tabling/generic";
import { framework as budgetFramework } from "../BudgetTable";

type R = Tables.AccountRowData;
type M = Model.Account;

const Columns: Table.Column<R, M>[] = [
  budgetFramework.columnObjs.IdentifierColumn<R, M>({
    field: "identifier",
    headerName: "Account",
    tableFooterLabel: "" // Will be populated by Table.
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "description",
    headerName: "Account Description",
    minWidth: 200,
    flex: 100,
    columnType: "longText"
  })
];

export const BudgetColumns: Table.Column<R, M>[] = [
  ...Columns,
  framework.columnObjs.CalculatedColumn<R, M>({
    field: "estimated",
    headerName: "Estimated"
  }),
  framework.columnObjs.CalculatedColumn<R, M>({
    field: "actual",
    headerName: "Actual"
  }),
  framework.columnObjs.CalculatedColumn<R, M>({
    field: "variance",
    headerName: "Variance"
  })
];

export const TemplateColumns: Table.Column<R, M>[] = [
  ...Columns,
  framework.columnObjs.CalculatedColumn<R, M>({
    field: "estimated",
    headerName: "Estimated"
  })
];
