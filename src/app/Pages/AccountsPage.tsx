import React from "react";

import { budgeting } from "lib";

import { Portal, BreadCrumbs } from "components/layout";

interface AccountsPageProps<B extends Model.Budget | Model.Template> {
  readonly budget: B | null;
  readonly children: JSX.Element;
}

const AccountsPage = <B extends Model.Budget | Model.Template>({
  budget,
  children
}: AccountsPageProps<B>): JSX.Element => {
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
                label: b.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(b)
              })
            }
          ]}
        />
      </Portal>
      {children}
    </React.Fragment>
  );
};

export default AccountsPage;
