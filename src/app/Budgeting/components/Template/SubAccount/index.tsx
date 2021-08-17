import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { redux, budgeting } from "lib";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

import { actions } from "../../../store";
import SubAccountBudgetTable from "./SubAccountsTable";

const selectDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.detail.data
);
const selectSubAccountsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.table.loading
);
const selectGroupsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.table.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);

interface SubAccountProps {
  readonly templateId: number;
  readonly template: Model.Template | undefined;
}

const SubAccount = ({ template, templateId }: SubAccountProps): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);

  useEffect(() => {
    dispatch(actions.template.setTemplateAutoIndex(true));
  }, []);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(actions.template.subAccount.setSubAccountIdAction(parseInt(subaccountId)));
      // TODO: It might not be necessary to get a fresh set of fringes everytime the SubAccount changes,
      // we might be able to move this further up in the tree - but for now it is safer to rely on the
      // source of truth from the API more often than not.
      dispatch(actions.template.subAccount.requestFringesAction(null));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(templateId) && !isNaN(parseInt(subaccountId))) {
      budgeting.urls.setTemplateLastVisited(templateId, `/templates/${templateId}/subaccounts/${subaccountId}`);
    }
  }, [templateId]);

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
                const ancestors = subaccount.ancestors || [];
                return [
                  ...map(ancestors.slice(1), (ancestor: Model.Entity) => {
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
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountBudgetTable template={template} templateId={templateId} subaccountId={parseInt(subaccountId)} />
      </WrapInApplicationSpinner>
    </RenderIfValidId>
  );
};

export default SubAccount;
