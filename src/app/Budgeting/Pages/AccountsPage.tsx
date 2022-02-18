import React from "react";

import { budgeting } from "lib";

import { Portal, BreadCrumbs } from "components/layout";

interface AccountsPageProps<B extends Model.Budget | Model.Template> {
  readonly budget: B | null;
  readonly tokenId?: string;
  readonly children: React.ReactChild | React.ReactChild[];
}

const AccountsPage = <B extends Model.Budget | Model.Template>({
  budget,
  children,
  tokenId
}: AccountsPageProps<B>): JSX.Element => {
  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs<{ b: B }>
          params={{ b: budget }}
          items={[
            {
              requiredParams: ["b"],
              func: ({ b }: { b: B }) => ({
                id: b.id,
                primary: true,
                label: b.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(b, undefined, tokenId)
              })
            }
          ]}
        />
      </Portal>
      {children}
    </React.Fragment>
  );
};

export default React.memo(AccountsPage);
