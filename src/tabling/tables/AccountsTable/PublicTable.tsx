import { useHistory } from "react-router-dom";

import { budgeting } from "lib";
import { PublicBudgetTable, PublicBudgetTableProps } from "../BudgetTable";

type R = Tables.AccountRowData;
type M = Model.Account;
type S = Tables.AccountTableStore;

type OmitProps = "onRowExpand" | "showPageFooter" | "pinFirstColumn" | "tableId" | "menuPortalId";

export type PublicTableProps<B extends Model.BaseBudget> = Omit<PublicBudgetTableProps<R, M, S>, OmitProps> & {
  readonly id: B["id"];
  readonly parent: B | null;
  readonly domain: B["domain"];
  readonly tokenId: string;
  readonly actionContext: Tables.AccountTableContext;
};

const PublicTable = <B extends Model.BaseBudget>(props: PublicTableProps<B>): JSX.Element => {
  const history = useHistory();

  return (
    <PublicBudgetTable
      {...props}
      showPageFooter={false}
      pinFirstColumn={true}
      tableId={`public-${props.domain}-accounts`}
      menuPortalId={"supplementary-header"}
      onRowExpand={(row: Table.ModelRow<R>) =>
        history.push(
          budgeting.urls.getUrl({ domain: props.domain, id: props.id }, { type: "account", id: row.id }, props.tokenId)
        )
      }
    />
  );
};

export default PublicTable;
