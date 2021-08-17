import { useMemo } from "react";
import { isNil } from "lodash";

import { util, hooks } from "lib";
import { framework } from "components/tabling/generic";

import { ReadWriteBudgetTable, ReadWriteBudgetTableProps } from "../BudgetTable";
import AccountsTable, { AccountsTableProps, WithAccountsTableProps } from "./AccountsTable";

type R = Tables.AccountRow;
type M = Model.Account;

export type ReadWriteTemplateAccountsTableProps = AccountsTableProps &
  Omit<ReadWriteBudgetTableProps<R, M>, "columns" | "cookieNames" | "budgetType" | "levelType" | "getRowChildren"> & {
    readonly budget?: Model.Template;
    readonly tableRef?: NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>>;
    readonly cookieNames?: Table.CookieNames;
    readonly onEditGroup: (group: Model.Group) => void;
  };

const ReadWriteTemplateAccountsTable = (
  props: WithAccountsTableProps<ReadWriteTemplateAccountsTableProps>
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
      })
    ];
  }, [hooks.useDeepEqualMemo(props.columns)]);

  return (
    <ReadWriteBudgetTable<R, M>
      {...props}
      actions={(params: Table.ReadWriteMenuActionParams<R, M>) => [
        {
          icon: "folder",
          disabled: true,
          text: "Group",
          isWriteOnly: true
        },
        {
          icon: "badge-percent",
          disabled: true,
          text: "Mark Up",
          isWriteOnly: true
        }
      ]}
      columns={columns}
      budgetType={"budget"}
    />
  );
};

export default AccountsTable<ReadWriteTemplateAccountsTableProps>(ReadWriteTemplateAccountsTable);
