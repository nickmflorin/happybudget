import React from "react";
import { map, isNil } from "lodash";

import { budgeting } from "lib";

import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

interface SubAccountPageProps<B extends Model.Budget | Model.Template> {
  readonly budget: B | null;
  readonly tokenId?: string;
  readonly detail: Model.SubAccount | null;
  readonly children: React.ReactChild | React.ReactChild[];
}

const SubAccountPage = <B extends Model.Budget | Model.Template>({
  budget,
  detail,
  children,
  tokenId
}: SubAccountPageProps<B>): JSX.Element => {
  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs<{ b: B; subaccount: Model.SubAccount }>
          params={{ b: budget, subaccount: detail }}
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
            },
            {
              requiredParams: ["b", "subaccount"],
              func: ({ b, subaccount }: { b: B; subaccount: Model.SubAccount }): IBreadCrumbItem[] => {
                const ancestors = (subaccount.ancestors || []).slice(1) as [
                  Model.SimpleAccount,
                  ...Array<Model.SimpleSubAccount>
                ];
                return [
                  ...map(ancestors, (ancestor: Model.SimpleAccount | Model.SimpleSubAccount) => {
                    return {
                      id: ancestor.id,
                      renderContent: () => <EntityText fillEmpty={"---------"}>{ancestor}</EntityText>,
                      url: budgeting.urls.getUrl(b, ancestor, tokenId)
                    };
                  }),
                  {
                    id: subaccount.id,
                    url: budgeting.urls.getUrl(b, subaccount, tokenId),
                    renderContent: () => {
                      if (!isNil(subaccount.table) && subaccount.table.length !== 0) {
                        return <EntityTextButton fillEmpty={"---------"}>{subaccount}</EntityTextButton>;
                      }
                      return <EntityText fillEmpty={"---------"}>{subaccount}</EntityText>;
                    },
                    options: map(subaccount.table || [], (option: Model.SimpleSubAccount) => ({
                      id: option.id,
                      url: budgeting.urls.getUrl(b, option),
                      defaultFocused: option.id === subaccount.id,
                      renderContent: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                    }))
                  }
                ];
              }
            }
          ]}
        />
      </Portal>
      {children}
    </React.Fragment>
  );
};

export default React.memo(SubAccountPage);
