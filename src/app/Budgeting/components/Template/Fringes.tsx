import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { WrapInApplicationSpinner } from "components";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setInstanceAction, addFringesPlaceholdersToStateAction } from "../../store/actions/template";
import {
  setFringesSearchAction,
  deselectFringeAction,
  selectFringeAction,
  removeFringeAction,
  updateFringeAction,
  selectAllFringesAction,
  bulkUpdateTemplateFringesAction
} from "../../store/actions/template/fringes";

import FringesBudgetTable from "../FringesBudgetTable";

const selectSelectedRows = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.template.fringes.selected);
const selectData = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.template.fringes.data);
const selectTableSearch = simpleShallowEqualSelector((state: Redux.ApplicationStore) => state.template.fringes.search);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.template.fringes.placeholders
);
const selectLoading = simpleShallowEqualSelector((state: Redux.ApplicationStore) => state.template.fringes.loading);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.template.fringes.deleting,
  (state: Redux.ApplicationStore) => state.template.fringes.updating,
  (state: Redux.ApplicationStore) => state.template.fringes.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);

const Fringes = (): JSX.Element => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const data = useSelector(selectData);
  const placeholders = useSelector(selectPlaceholders);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);

  useEffect(() => {
    dispatch(setInstanceAction(null));
  }, []);

  return (
    <WrapInApplicationSpinner loading={loading}>
      <FringesBudgetTable
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
          dispatch(bulkUpdateTemplateFringesAction(changes))
        }
        onSelectAll={() => dispatch(selectAllFringesAction(null))}
      />
    </WrapInApplicationSpinner>
  );
};

export default Fringes;
