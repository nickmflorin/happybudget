import { useHistory } from "react-router-dom";

import { budgeting } from "lib";

import { PublicBudgetTable, PublicBudgetTableProps } from "../BudgetTable";

type R = Tables.AccountRowData;
type M = Model.Account;
type S = Tables.AccountTableStore;

type OmitProps = "onRowExpand" | "showPageFooter" | "pinFirstColumn" | "tableId" | "menuPortalId";

export type PublicTableProps<B extends Model.BaseBudget> = Omit<
  PublicBudgetTableProps<R, M, B, AccountsTableContext<B, true>, S>,
  OmitProps
> & {
  readonly parent: B | null;
  readonly tokenId: string;
};

const PublicTable = <B extends Model.BaseBudget>(props: PublicTableProps<B>): JSX.Element => {
  const history = useHistory();

  return (
    <PublicBudgetTable
      {...props}
      showPageFooter={false}
      pinFirstColumn={true}
      tableId={`public-${props.tableContext.domain}-accounts`}
      menuPortalId="supplementary-header"
      onRowExpand={(row: Table.ModelRow<R>) =>
        history.push(
          budgeting.urls.getUrl(
            { domain: props.tableContext.domain, id: props.tableContext.budgetId },
            { type: "account", id: row.id },
          ),
        )
      }
    />
  );
};

export default PublicTable;
