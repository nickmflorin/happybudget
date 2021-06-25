import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setTemplateAutoIndex } from "../../../store/actions/template";
import { setSubAccountIdAction } from "../../../store/actions/template/subAccount";
import { requestFringesAction } from "../../../store/actions/template/fringes";
import { selectTemplateId, selectTemplateDetail } from "../../../store/selectors";
import { setTemplateLastVisited, getUrl } from "../../../urls";

import SubAccountBudgetTable from "./SubAccountsTable";

const selectDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.detail.data
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.groups.loading
);
const selectLoading = createSelector(
  selectSubAccountsLoading,
  selectGroupsLoading,
  (tableLoading: boolean, groupsLoading: boolean) => tableLoading || groupsLoading
);
const SubAccount = (): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();
  const templateId = useSelector(selectTemplateId);
  const loading = useSelector(selectLoading);
  const detail = useSelector(selectDetail);
  const templateDetail = useSelector(selectTemplateDetail);

  useEffect(() => {
    dispatch(setTemplateAutoIndex(true));
  }, []);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(setSubAccountIdAction(parseInt(subaccountId)));
      // TODO: It might not be necessary to get a fresh set of fringes everytime the SubAccount changes,
      // we might be able to move this further up in the tree - but for now it is safer to rely on the
      // source of truth from the API more often than not.
      dispatch(requestFringesAction(null));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(templateId) && !isNaN(parseInt(subaccountId))) {
      setTemplateLastVisited(templateId, `/templates/${templateId}/subaccounts/${subaccountId}`);
    }
  }, [templateId]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ template: templateDetail, subaccount: detail }}
          items={[
            {
              requiredParams: ["template"],
              func: ({ template }: { template: Model.Template }) => ({
                id: template.id,
                primary: true,
                text: template.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: getUrl(template)
              })
            },
            {
              requiredParams: ["template", "subaccount"],
              func: ({ template, subaccount }: { template: Model.Template; subaccount: Model.TemplateSubAccount }) => {
                return [
                  ...map(subaccount.ancestors.slice(1), (ancestor: Model.Entity) => {
                    return {
                      id: ancestor.id,
                      render: () => <EntityText fillEmpty={"---------"}>{ancestor}</EntityText>,
                      url: getUrl(template, ancestor)
                    };
                  }),
                  {
                    id: subaccount.id,
                    url: getUrl(template, subaccount),
                    render: (params: IBreadCrumbItemRenderParams) => {
                      if (subaccount.siblings.length !== 0) {
                        return (
                          <EntityTextButton onClick={() => params.toggleDropdownVisible()} fillEmpty={"---------"}>
                            {subaccount}
                          </EntityTextButton>
                        );
                      }
                      return <EntityText fillEmpty={"---------"}>{subaccount}</EntityText>;
                    },
                    options: map(subaccount.siblings, (option: Model.SimpleSubAccount) => ({
                      id: option.id,
                      url: getUrl(template, option),
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
        <SubAccountBudgetTable subaccountId={parseInt(subaccountId)} />
      </WrapInApplicationSpinner>
    </RenderIfValidId>
  );
};

export default SubAccount;
