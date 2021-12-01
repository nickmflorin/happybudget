import React from "react";
import { map } from "lodash";

import { budgeting } from "lib";

import { RenderIfValidId } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

interface AccountPageProps<B extends Model.Budget | Model.Template> {
  readonly budget: B | null;
  readonly accountId: string;
  readonly detail: Model.Account | null;
  readonly children: JSX.Element;
}

const AccountPage = <B extends Model.Budget | Model.Template>({
  budget,
  accountId,
  detail,
  children
}: AccountPageProps<B>): JSX.Element => {
  return (
    <RenderIfValidId id={[accountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ b: budget, account: detail }}
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
            },
            {
              requiredParams: ["b", "account"],
              func: ({ b, account }: { b: Model.Budget; account: Model.Account }) => {
                const siblings = account.siblings || [];
                return {
                  id: account.id,
                  primary: true,
                  url: budgeting.urls.getUrl(b, account),
                  render: () => {
                    if (siblings.length !== 0) {
                      return <EntityTextButton fillEmpty={"---------"}>{account}</EntityTextButton>;
                    }
                    return <EntityText fillEmpty={"---------"}>{account}</EntityText>;
                  },
                  options: map(siblings, (option: Model.SimpleAccount) => ({
                    id: option.id,
                    url: budgeting.urls.getUrl(b, option),
                    render: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                  }))
                };
              }
            }
          ]}
        />
      </Portal>
      {children}
    </RenderIfValidId>
  );
};

export default React.memo(AccountPage);
