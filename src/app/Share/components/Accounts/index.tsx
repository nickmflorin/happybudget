import React from "react";

import { budgeting } from "lib";
import { Portal, BreadCrumbs } from "components/layout";

import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const Accounts = ({ budget, budgetId }: AccountsProps): JSX.Element => {
  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ b: budget }}
          items={[
            {
              requiredParams: ["b"],
              func: ({ b }: { b: Model.Budget }) => ({
                id: b.id,
                primary: true,
                text: b.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(b)
              })
            }
          ]}
        />
      </Portal>
      <AccountsTable budget={budget} budgetId={budgetId} />
    </React.Fragment>
  );
};

export default Accounts;
