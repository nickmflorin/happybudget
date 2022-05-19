import React from "react";
import { map, isNil } from "lodash";

import { budgeting } from "lib";

import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

interface BudgetPageProps<B extends Model.Budget | Model.Template, P extends Model.Account | Model.SubAccount> {
  readonly budget: B | null;
  readonly tokenId?: string;
  readonly parent?: P | null;
  readonly children: React.ReactChild | React.ReactChild[];
}

const BudgetPage = <B extends Model.Budget | Model.Template, P extends Model.Account | Model.SubAccount>({
  budget,
  parent,
  children,
  tokenId
}: BudgetPageProps<B, P>): JSX.Element => (
  <React.Fragment>
    <Portal id={"breadcrumbs"}>
      <BreadCrumbs<{ b: B; p: P }>
        params={{ b: budget, p: parent || null }}
        items={[
          {
            requiredParams: ["b"],
            func: ({ b }: { b: B }) => ({
              id: b.id,
              primary: true,
              label: b.name,
              tooltip: { content: "Top Sheet", placement: "bottom" },
              url: budgeting.urls.getUrl(b, undefined, tokenId)
            })
          },
          {
            requiredParams: ["b", "p"],
            func: ({ b, p }: { b: B; p: P }): IBreadCrumbItem[] => {
              /* If the parent is an Account, the first and only ancestor will
                   be a SimpleBudget.  If the parent is a SubAccount, the first
									 ancestor will be a SimpleBudget, the next ancestor will be
									 a SimpleAccount, and then the subsequent ancestors will be
									 SimpleSubAccount(s) (if present).

									 Model.Account:
									 	ancestors: [Model.SimpleBudget]

									 Model.SubAccount:
									 	ancestors: [
											 Model.SimpleBudget,
											 Model.SimpleAccount,
											 Model.SimpleSubAccount,
											 ...
										]
									 */
              const ancestors = (p.ancestors || []).slice(1) as
                | [Model.SimpleAccount, ...Array<Model.SimpleSubAccount>]
                | [];

              const table = (p.table || []) as (Model.SimpleAccount | Model.SimpleSubAccount)[];
              return [
                ...map(ancestors, (ancestor: Model.SimpleAccount | Model.SimpleSubAccount) => {
                  return {
                    id: ancestor.id,
                    renderContent: () => <EntityText fillEmpty={"---------"}>{ancestor}</EntityText>,
                    url: budgeting.urls.getUrl(b, ancestor, tokenId)
                  };
                }),
                {
                  id: p.id,
                  url: budgeting.urls.getUrl(b, p, tokenId),
                  renderContent: () => {
                    if (!isNil(p.table) && p.table.length !== 0) {
                      return <EntityTextButton fillEmpty={"---------"}>{p}</EntityTextButton>;
                    }
                    return <EntityText fillEmpty={"---------"}>{p}</EntityText>;
                  },
                  options: map(table, (option: Model.SimpleAccount | Model.SimpleSubAccount) => ({
                    id: option.id,
                    url: budgeting.urls.getUrl(b, option, tokenId),
                    defaultFocused: option.id === p.id,
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

export default React.memo(BudgetPage);
