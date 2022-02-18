import React, { useEffect } from "react";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { AccountsPage } from "app/Budgeting/Pages";
import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly budgetId: number;
  readonly tokenId: string;
  readonly budget: Model.Budget | null;
}

const Accounts = (props: AccountsProps): JSX.Element => {
  useEffect(() => {
    if (!isNil(props.budget)) {
      budgeting.urls.setLastVisited(props.budget, undefined, props.tokenId);
    }
  }, [props.budget]);

  return (
    <AccountsPage {...props}>
      <AccountsTable {...props} />
    </AccountsPage>
  );
};

export default React.memo(Accounts);
