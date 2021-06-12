import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { RenderIfValidId, WrapInApplicationSpinner } from "components";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction, setTemplateAutoIndex } from "../../../store/actions/template";
import { setSubAccountIdAction } from "../../../store/actions/template/subAccount";
import { requestFringesAction } from "../../../store/actions/template/fringes";
import { selectTemplateId } from "../../../store/selectors";
import { setTemplateLastVisited } from "../../../urls";

import SubAccountBudgetTable from "./SubAccountsTable";

const selectDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.detail.data
);
const selectSubAccountsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.loading
);
const selectGroupsLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.groups.loading
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
    if (!isNil(detail)) {
      dispatch(setInstanceAction(detail));
    }
  }, [detail]);

  useEffect(() => {
    if (!isNil(templateId) && !isNaN(parseInt(subaccountId))) {
      setTemplateLastVisited(templateId, `/templates/${templateId}/subaccounts/${subaccountId}`);
    }
  }, [templateId]);

  return (
    <RenderIfValidId id={[subaccountId]}>
      <WrapInApplicationSpinner loading={loading}>
        <SubAccountBudgetTable subaccountId={parseInt(subaccountId)} />
      </WrapInApplicationSpinner>
    </RenderIfValidId>
  );
};

export default SubAccount;
