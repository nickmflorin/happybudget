import { useEffect } from "react";
import { isNil } from "lodash";

import { budgeting } from "lib";

import { AccountsPage } from "app/Pages";
import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const Accounts = ({ budgetId, budget }: AccountsProps): JSX.Element => {
  useEffect(() => {
    if (!isNil(budget)) {
      budgeting.urls.setLastVisited(budget);
    }
  }, [budget]);

  return (
    <AccountsPage budget={budget}>
      <AccountsTable budget={budget} budgetId={budgetId} />
    </AccountsPage>
  );
};

export default Accounts;
