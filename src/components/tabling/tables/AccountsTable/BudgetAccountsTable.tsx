import { isNil } from "lodash";

import GenericAccountsTable, { GenericAccountsTableProps } from "./Generic";

type OmitTableProps = "budgetType" | "columns" | "tableFooterIdentifierValue" | "exportFileName";

export type BudgetAccountsTableProps = Omit<GenericAccountsTableProps, OmitTableProps> & {
  readonly budget: Model.Budget | undefined;
};

const BudgetAccountsTable = ({ budget, ...props }: BudgetAccountsTableProps): JSX.Element => {
  return (
    <GenericAccountsTable
      {...props}
      budgetType={"budget"}
      tableFooterIdentifierValue={!isNil(budget) ? `${budget.name} Total` : "Total"}
      exportFileName={!isNil(budget) ? `budget_${budget.name}_accounts` : ""}
      columns={[
        {
          field: "estimated",
          headerName: "Estimated",
          isCalculated: true,
          columnType: "sum",
          fieldBehavior: ["read"],
          footer: {
            value: !isNil(budget) && !isNil(budget.estimated) ? budget.estimated : 0.0
          }
        },
        {
          field: "actual",
          headerName: "Actual",
          isCalculated: true,
          columnType: "sum",
          fieldBehavior: ["read"],
          footer: {
            value: !isNil(budget) && !isNil(budget.actual) ? budget.actual : 0.0
          }
        },
        {
          field: "variance",
          headerName: "Variance",
          isCalculated: true,
          columnType: "sum",
          fieldBehavior: ["read"],
          footer: {
            value: !isNil(budget) && !isNil(budget.variance) ? budget.variance : 0.0
          }
        }
      ]}
    />
  );
};

export default BudgetAccountsTable;
