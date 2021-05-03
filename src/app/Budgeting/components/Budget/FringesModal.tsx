import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { addFringesPlaceholdersToStateAction } from "../../store/actions/budget";
import {
  setFringesSearchAction,
  deselectFringeAction,
  selectFringeAction,
  removeFringeAction,
  updateFringeAction,
  selectAllFringesAction,
  bulkUpdateBudgetFringesAction
} from "../../store/actions/budget/fringes";
import { GenericFringesModal, GenericFringesModalProps } from "../Generic";

const selectSelectedRows = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.fringes.selected);
const selectData = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.fringes.data);
const selectTableSearch = simpleShallowEqualSelector((state: Redux.ApplicationStore) => state.budget.fringes.search);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.fringes.placeholders
);
const selectLoading = simpleShallowEqualSelector((state: Redux.ApplicationStore) => state.budget.fringes.loading);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budget.fringes.deleting,
  (state: Redux.ApplicationStore) => state.budget.fringes.updating,
  (state: Redux.ApplicationStore) => state.budget.fringes.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);

const FringesModal: React.FC<Pick<GenericFringesModalProps, "open" | "onCancel">> = ({ open, onCancel }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const data = useSelector(selectData);
  const placeholders = useSelector(selectPlaceholders);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);

  return (
    <GenericFringesModal
      open={open}
      onCancel={onCancel}
      loading={loading}
      data={data}
      placeholders={placeholders}
      selected={selected}
      search={search}
      onSearch={(value: string) => dispatch(setFringesSearchAction(value))}
      saving={saving}
      onRowAdd={() => dispatch(addFringesPlaceholdersToStateAction(1))}
      onRowSelect={(id: number) => dispatch(selectFringeAction(id))}
      onRowDeselect={(id: number) => dispatch(deselectFringeAction(id))}
      onRowDelete={(row: Table.FringeRow) => dispatch(removeFringeAction(row.id))}
      onRowUpdate={(payload: Table.RowChange<Table.FringeRow>) => dispatch(updateFringeAction(payload))}
      onRowBulkUpdate={(changes: Table.RowChange<Table.FringeRow>[]) =>
        dispatch(bulkUpdateBudgetFringesAction(changes))
      }
      onSelectAll={() => dispatch(selectAllFringesAction(null))}
    />
  );
};

export default FringesModal;
