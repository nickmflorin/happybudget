import { framework } from "components/tabling/generic";
import { framework as budgetFramework } from "../BudgetTable";

type R = Tables.AccountRowData;
type M = Model.Account;

const Columns: Table.Column<R, M, Model.BudgetGroup>[] = [
  budgetFramework.columnObjs.IdentifierColumn<R, M>({
    field: "identifier",
    headerName: "Account"
  }),
  framework.columnObjs.BodyColumn<R, M, Model.BudgetGroup>({
    field: "description",
    headerName: "Account Description",
    minWidth: 200,
    flex: 100,
    columnType: "longText"
  })
];

export const BudgetColumns: Table.Column<R, M, Model.BudgetGroup>[] = [
  ...Columns,
  framework.columnObjs.CalculatedColumn<R, M, Model.BudgetGroup>({
    field: "estimated",
    headerName: "Estimated",
    groupField: "estimated"
  }),
  framework.columnObjs.CalculatedColumn<R, M, Model.BudgetGroup>({
    field: "actual",
    headerName: "Actual",
    groupField: "actual"
  }),
  framework.columnObjs.CalculatedColumn<R, M, Model.BudgetGroup>({
    field: "variance",
    headerName: "Variance",
    groupField: "variance"
  })
];

export const TemplateColumns: Table.Column<R, M, Model.BudgetGroup>[] = [
  ...Columns,
  framework.columnObjs.CalculatedColumn<R, M, Model.BudgetGroup>({
    field: "estimated",
    headerName: "Estimated",
    groupField: "estimated"
  })
];
