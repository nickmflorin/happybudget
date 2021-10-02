import { useEffect } from "react";
import { isNil } from "lodash";

import { budgeting } from "lib";

import { AccountsPage } from "app/Pages";
import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly templateId: number;
  readonly template: Model.Template | null;
}

const Accounts = ({ templateId, template }: AccountsProps): JSX.Element => {
  useEffect(() => {
    if (!isNil(template)) {
      budgeting.urls.setLastVisited(template);
    }
  }, [template]);

  return (
    <AccountsPage budget={template}>
      <AccountsTable template={template} templateId={templateId} />
    </AccountsPage>
  );
};

export default Accounts;
