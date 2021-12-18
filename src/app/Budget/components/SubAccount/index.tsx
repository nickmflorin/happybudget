import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isNil } from "lodash";

import { budgeting } from "lib";

import { SubAccountPage } from "app/Pages";

import { actions } from "../../store";
import SubAccountsTable from "./SubAccountsTable";

const selectDetail = (state: Application.AuthenticatedStore) => state.budget.subaccount.detail.data;

interface SubAccountProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const SubAccount = ({ budgetId, budget, setPreviewModalVisible }: SubAccountProps): JSX.Element => {
  const { subaccountId } = useParams<{ subaccountId: string }>();
  const dispatch = useDispatch();
  const detail = useSelector(selectDetail);

  useEffect(() => {
    if (!isNaN(parseInt(subaccountId))) {
      dispatch(actions.subAccount.requestSubAccountAction(parseInt(subaccountId)));
    }
  }, [subaccountId]);

  useEffect(() => {
    if (!isNil(budget) && !isNil(detail)) {
      budgeting.urls.setLastVisited(budget, detail);
    }
  }, [budget, detail]);

  return (
    <SubAccountPage detail={detail} subaccountId={subaccountId} budget={budget}>
      <SubAccountsTable
        budget={budget}
        budgetId={budgetId}
        subaccountId={parseInt(subaccountId)}
        setPreviewModalVisible={setPreviewModalVisible}
      />
    </SubAccountPage>
  );
};

export default SubAccount;
