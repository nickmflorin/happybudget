import React from "react";
import { map, isNil } from "lodash";

import { budgeting } from "lib";

import { RenderIfValidId } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

interface AccountPageProps<B extends Model.Budget | Model.Template> {
  readonly budget: B | null;
  readonly accountId: string;
  readonly detail: Model.Account | null;
  readonly children: React.ReactChild | React.ReactChild[];
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
        <BreadCrumbs<{ b: B; account: Model.Account }>
          params={{ b: budget, account: detail }}
          items={[
            {
              requiredParams: ["b"],
              func: ({ b }: { b: B }) => ({
                id: b.id,
                primary: true,
                label: b.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(b)
              })
            },
            {
              requiredParams: ["b", "account"],
              func: ({ b, account }: { b: B; account: Model.Account }) => {
                return {
                  id: account.id,
                  primary: true,
                  url: budgeting.urls.getUrl(b, account),
                  renderContent: () => {
                    if (!isNil(account.table) && account.table.length !== 0) {
                      return <EntityTextButton fillEmpty={"---------"}>{account}</EntityTextButton>;
                    }
                    return <EntityText fillEmpty={"---------"}>{account}</EntityText>;
                  },
                  options: map(account.table || [], (option: Model.SimpleAccount) => ({
                    id: option.id,
                    url: budgeting.urls.getUrl(b, option),
                    defaultFocused: option.id === account.id,
                    renderContent: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
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
