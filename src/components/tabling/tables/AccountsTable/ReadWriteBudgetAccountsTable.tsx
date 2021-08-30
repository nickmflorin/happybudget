import { useMemo } from "react";
import { isNil } from "lodash";

import { util, hooks, tabling } from "lib";
import { framework } from "components/tabling/generic";

import { ReadWriteBudgetTable, ReadWriteBudgetTableProps } from "../BudgetTable";
import AccountsTable, { AccountsTableProps, WithAccountsTableProps } from "./AccountsTable";

type R = Tables.AccountRow;
type M = Model.Account;

export type ReadWriteBudgetAccountsTableProps = AccountsTableProps &
  Omit<ReadWriteBudgetTableProps<R, M>, "columns" | "cookieNames" | "budgetType" | "levelType" | "getRowChildren"> & {
    readonly budget?: Model.Budget;
    readonly tableRef?: NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>>;
    readonly cookieNames?: Table.CookieNames;
    readonly onEditGroup: (group: Model.Group) => void;
  };

const ReadWriteBudgetAccountsTable = (
  props: WithAccountsTableProps<ReadWriteBudgetAccountsTableProps>
): JSX.Element => {
  const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    return [
      ...util.updateInArray<Table.Column<R, M>>(
        props.columns,
        { field: "identifier" },
        {
          cellRendererParams: {
            onGroupEdit: props.onEditGroup
          }
        }
      ),
      framework.columnObjs.CalculatedColumn({
        field: "estimated",
        headerName: "Estimated",
        footer: {
          value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
        }
      }),
      framework.columnObjs.CalculatedColumn({
        field: "actual",
        headerName: "Actual",
        footer: {
          value: !isNil(props.budget) && !isNil(props.budget.actual) ? props.budget.actual : 0.0
        }
      }),
      framework.columnObjs.CalculatedColumn({
        field: "variance",
        headerName: "Variance",
        footer: {
          value: !isNil(props.budget) && !isNil(props.budget.variance) ? props.budget.variance : 0.0
        }
      })
    ];
  }, [hooks.useDeepEqualMemo(props.columns)]);

  return (
    <ReadWriteBudgetTable<R, M>
      {...props}
      actions={tabling.util.combineMenuActions(
        [
          {
            icon: "folder",
            disabled: true,
            label: "Group",
            isWriteOnly: true
          },
          {
            icon: "badge-percent",
            disabled: true,
            label: "Mark Up",
            isWriteOnly: true
          }
        ],
        !isNil(props.actions) ? props.actions : []
      )}
      columns={columns}
      budgetType={"budget"}
    />
  );
};

export default AccountsTable<ReadWriteBudgetAccountsTableProps>(ReadWriteBudgetAccountsTable);
