import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import * as actions from "../../store/actions/template/fringes";
import { GenericFringesModal, GenericFringesModalProps } from "../Generic";

const selectData = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.budgeting.template.fringes.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.fringes.search
);
const selectLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.fringes.loading
);
const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.fringes.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.template.fringes.updating,
  (state: Modules.ApplicationStore) => state.budgeting.template.fringes.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);

const FringesModal: React.FC<Pick<GenericFringesModalProps, "open" | "onCancel">> = ({ open, onCancel }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const data = useSelector(selectData);
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
      search={search}
      onSearch={(value: string) => dispatch(actions.setFringesSearchAction(value))}
      saving={saving}
      onRowAdd={(payload: Table.RowAddPayload<BudgetTable.FringeRow>) =>
        dispatch(actions.bulkCreateFringesAction(payload))
      }
      onRowDelete={(ids: number | number[]) => dispatch(actions.deleteFringesAction(ids))}
      onTableChange={(payload: Table.Change<BudgetTable.FringeRow>) => dispatch(actions.tableChangedAction(payload))}
    />
  );
};

export default FringesModal;
