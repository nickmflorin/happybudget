import React, { useEffect } from "react";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { AccountsPage } from "app/Pages";
import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly budgetId: number;
  readonly tokenId: string;
  readonly budget: Model.Budget | null;
}

const Accounts = ({ budget, budgetId, tokenId }: AccountsProps): JSX.Element => {
  useEffect(() => {
    if (!isNil(budget)) {
      budgeting.urls.setLastVisited(budget, undefined, tokenId);
    }
  }, [budget]);

  return (
    <AccountsPage budget={budget}>
      <AccountsTable budget={budget} budgetId={budgetId} tokenId={tokenId} />
    </AccountsPage>
  );
};

export default React.memo(Accounts);
