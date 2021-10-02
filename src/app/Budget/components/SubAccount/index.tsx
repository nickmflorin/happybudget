import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isNil, map } from "lodash";

import { budgeting } from "lib";

import { RenderIfValidId } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = (state: Application.Authenticated.Store) => state.budget.subaccount.detail.data;

interface SubAccountProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const SubAccount = ({ budgetId, budget }: SubAccountProps): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();

  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(actions.subAccount.setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(budget) && !isNil(detail)) {
      budgeting.urls.setLastVisited(budget, detail);
    }
  }, [budget, detail]);

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
                      render: () => <EntityText fillEmpty={"---------"}>{ancestor}</EntityText>,
                      url: budgeting.urls.getUrl(b, ancestor)
                    };
                  }),
                  {
                    id: subaccount.id,
                    url: budgeting.urls.getUrl(b, subaccount),
                    render: () => {
                      if (siblings.length !== 0) {
                        return <EntityTextButton fillEmpty={"---------"}>{subaccount}</EntityTextButton>;
                      }
                      return <EntityText fillEmpty={"---------"}>{subaccount}</EntityText>;
                    },
                    options: map(siblings, (option: Model.SimpleSubAccount) => ({
                      id: option.id,
                      url: budgeting.urls.getUrl(b, option),
                      render: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                    }))
                  }
                ];
              }
            }
          ]}
        />
      </Portal>
      <SubAccountsTable budget={budget} budgetId={budgetId} subaccountId={parseInt(subaccountId)} />
      {/* <SubAccountCommentsHistory /> */}
    </RenderIfValidId>
  );
};

export default SubAccount;
