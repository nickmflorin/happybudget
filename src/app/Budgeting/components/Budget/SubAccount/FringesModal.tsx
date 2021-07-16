import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import * as actions from "../../../store/actions/budget/subAccount";
import { selectBudgetDetail } from "../../../store/selectors";
import { GenericFringesModal, GenericFringesModalProps } from "../../Generic";

const selectData = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.fringes.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.fringes.search
);
const selectLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.fringes.loading
);
const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.fringes.deleting,
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.fringes.updating,
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.fringes.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);

const FringesModal: React.FC<Pick<GenericFringesModalProps, "open" | "onCancel">> = ({ open, onCancel }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const budgetDetail = useSelector(selectBudgetDetail);

  useEffect(() => {
    // TODO: It might not be necessary to always refresh the Fringes when the modal opens, but it is
    // safer for now to rely on the API as a source of truth more often than not.
    if (open === true) {
      dispatch(actions.requestFringesAction(null));
    }
  }, [open]);

  return (
    <GenericFringesModal
      exportFileName={!isNil(budgetDetail) ? `${budgetDetail.name}_fringes` : "fringes"}
      open={open}
      onCancel={onCancel}
      loading={loading}
      data={data}
      search={search}
      onSearch={(value: string) => dispatch(actions.setFringesSearchAction(value))}
      saving={saving}
      onChangeEvent={(e: Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe>) =>
        dispatch(actions.handleFringesTableChangeEventAction(e))
      }
    />
  );
};

export default FringesModal;
