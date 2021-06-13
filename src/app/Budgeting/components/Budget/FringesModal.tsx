import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import * as actions from "../../store/actions/budget/fringes";
import { GenericFringesModal, GenericFringesModalProps } from "../Generic";

const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.selected
);
const selectData = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budgeting.budget.fringes.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.search
);
const selectLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.loading
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.deleting,
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.updating,
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);

const FringesModal: React.FC<Pick<GenericFringesModalProps, "open" | "onCancel">> = ({ open, onCancel }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const data = useSelector(selectData);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);

  useEffect(() => {
    // TODO: It might not be necessary to always refresh the Fringes when the modal opens, but it is
    // safer for now to rely on the API as a source of truth more often than not.
    if (open === true) {
      dispatch(actions.requestFringesAction(null));
    }
  }, [open]);

  return (
    <GenericFringesModal
      open={open}
      onCancel={onCancel}
      loading={loading}
      data={data}
      selected={selected}
      search={search}
      onSearch={(value: string) => dispatch(actions.setFringesSearchAction(value))}
      saving={saving}
      onRowAdd={() => dispatch(actions.bulkCreateFringesAction(1))}
      onRowSelect={(id: number) => dispatch(actions.selectFringeAction(id))}
      onRowDeselect={(id: number) => dispatch(actions.deselectFringeAction(id))}
      onRowDelete={(row: BudgetTable.FringeRow) => dispatch(actions.removeFringeAction(row.id))}
      onTableChange={(payload: Table.Change<BudgetTable.FringeRow>) => dispatch(actions.tableChangedAction(payload))}
      onSelectAll={() => dispatch(actions.selectAllFringesAction(null))}
    />
  );
};

export default FringesModal;
