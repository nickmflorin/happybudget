import React, { useEffect } from "react";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { AccountsPage } from "app/Pages";
import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const Accounts = (props: AccountsProps): JSX.Element => {
  useEffect(() => {
    if (!isNil(props.budget)) {
      budgeting.urls.setLastVisited(props.budget);
    }
  }, [props.budget]);

  return (
    <AccountsPage budget={props.budget}>
      <AccountsTable {...props} />
    </AccountsPage>
  );
};

export default React.memo(Accounts);
