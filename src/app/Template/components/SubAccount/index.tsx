import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isNil, map } from "lodash";

import { redux, budgeting } from "lib";

import { RenderIfValidId } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

import { actions } from "../../store";
import SubAccountBudgetTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.subaccount.detail.data
);

interface SubAccountProps {
  readonly templateId: number;
  readonly template: Model.Template | null;
}

const SubAccount = ({ template, templateId }: SubAccountProps): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(actions.subAccount.setSubAccountIdAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(template) && !isNil(detail)) {
      budgeting.urls.setLastVisited(template, detail);
    }
  }, [template]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ t: template, subaccount: detail }}
          items={[
            {
              requiredParams: ["t"],
              func: ({ t }: { t: Model.Template }) => ({
                id: t.id,
                primary: true,
                label: t.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(t)
              })
            },
            {
              requiredParams: ["t", "subaccount"],
              func: ({ t, subaccount }: { t: Model.Template; subaccount: Model.SubAccount }) => {
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
                      url: budgeting.urls.getUrl(t, ancestor)
                    };
                  }),
                  {
                    id: subaccount.id,
                    url: budgeting.urls.getUrl(t, subaccount),
                    render: () => {
                      if (siblings.length !== 0) {
                        return <EntityTextButton fillEmpty={"---------"}>{subaccount}</EntityTextButton>;
                      }
                      return <EntityText fillEmpty={"---------"}>{subaccount}</EntityText>;
                    },
                    options: map(siblings, (option: Model.SimpleSubAccount) => ({
                      id: option.id,
                      url: budgeting.urls.getUrl(t, option),
                      render: () => <EntityText fillEmpty={"---------"}>{option}</EntityText>
                    }))
                  }
                ];
              }
            }
          ]}
        />
      </Portal>
      <SubAccountBudgetTable template={template} templateId={templateId} subaccountId={parseInt(subaccountId)} />
    </RenderIfValidId>
  );
};

export default SubAccount;
