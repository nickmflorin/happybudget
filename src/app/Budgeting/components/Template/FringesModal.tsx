import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import {
  setFringesSearchAction,
  deselectFringeAction,
  selectFringeAction,
  removeFringeAction,
  selectAllFringesAction,
  tableChangedAction,
  requestFringesAction,
  addFringesPlaceholdersToStateAction
} from "../../store/actions/template/fringes";
import { GenericFringesModal, GenericFringesModalProps } from "../Generic";

const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.selected
);
const selectData = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budgeting.template.fringes.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.search
);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.placeholders
);
const selectLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.loading
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.deleting,
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.updating,
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.creating,
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

  useEffect(() => {
    // TODO: It might not be necessary to always refresh the Fringes when the modal opens, but it is
    // safer for now to rely on the API as a source of truth more often than not.
    if (open === true) {
      dispatch(requestFringesAction(null));
    }
  }, [open]);

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
      onTableChange={(payload: Table.Change<Table.FringeRow>) => dispatch(tableChangedAction(payload))}
      onSelectAll={() => dispatch(selectAllFringesAction(null))}
    />
  );
};

export default FringesModal;
