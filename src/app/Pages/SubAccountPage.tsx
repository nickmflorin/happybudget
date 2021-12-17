import React from "react";
import { map } from "lodash";

import { budgeting } from "lib";

import { RenderIfValidId } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

interface SubAccountPageProps<B extends Model.Budget | Model.Template> {
  readonly budget: B | null;
  readonly subaccountId: string;
  readonly detail: Model.SubAccount | null;
  readonly children: React.ReactChild | React.ReactChild[];
}

const SubAccountPage = <B extends Model.Budget | Model.Template>({
  budget,
  subaccountId,
  detail,
  children
}: SubAccountPageProps<B>): JSX.Element => {
  return (
    <RenderIfValidId id={[subaccountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ b: budget, subaccount: detail }}
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
              requiredParams: ["b", "subaccount"],
              func: ({ b, subaccount }: { b: Model.Budget; subaccount: Model.SubAccount }): IBreadCrumbItem[] => {
                const siblings = subaccount.siblings || [];
                const ancestors = (subaccount.ancestors || []).slice(1) as [
                  Model.SimpleAccount,
                  ...Array<Model.SimpleSubAccount>
                ];
                return [
                  ...map(ancestors, (ancestor: Model.SimpleAccount | Model.SimpleSubAccount) => {
                    return {
                      id: ancestor.id,
                      renderContent: () => <EntityText fillEmpty={"---------"}>{ancestor}</EntityText>,
                      url: budgeting.urls.getUrl(b, ancestor)
                    };
                  }),
                  {
                    id: subaccount.id,
                    url: budgeting.urls.getUrl(b, subaccount),
                    renderContent: () => {
                      if (siblings.length !== 0) {
                        return <EntityTextButton fillEmpty={"---------"}>{subaccount}</EntityTextButton>;
                      }
                      return <EntityText fillEmpty={"---------"}>{subaccount}</EntityText>;
                    },
                    options: map(siblings, (option: Model.SimpleSubAccount) => ({
                      id: option.id,
                      url: budgeting.urls.getUrl(b, option),
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
    </RenderIfValidId>
  );
};

export default React.memo(SubAccountPage);
