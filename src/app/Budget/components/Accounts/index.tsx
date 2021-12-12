import { useEffect } from "react";
import { isNil } from "lodash";

import { budgeting, hooks } from "lib";
import { AccountsPage } from "app/Pages";
import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const Accounts = ({ budget, budgetId, setPreviewModalVisible }: AccountsProps): JSX.Element => {
  useEffect(() => {
    if (!isNil(budget)) {
      budgeting.urls.setLastVisited(budget);
    }
  }, [budget]);

  return (
    <AccountsPage budget={budget}>
      <AccountsTable budget={budget} budgetId={budgetId} setPreviewModalVisible={setPreviewModalVisible} />
    </AccountsPage>
  );
};

export default hooks.deepMemo(Accounts);
