import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { CellClassParams } from "ag-grid-community";

import { WrapInApplicationSpinner } from "components/display";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { FringeMapping } from "model/tableMappings";

import { setInstanceAction } from "../actions";
import BudgetTable from "../BudgetTable";
import {
  requestFringesAction,
  setFringesSearchAction,
  addPlaceholdersToStateAction,
  deselectFringeAction,
  selectFringeAction,
  removeFringeAction,
  updateFringeAction,
  selectAllFringesAction
} from "./actions";

const selectSelectedRows = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.fringes.selected);
const selectData = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.fringes.data);
const selectTableSearch = simpleShallowEqualSelector((state: Redux.IApplicationStore) => state.budget.fringes.search);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.fringes.placeholders
);
const selectLoading = simpleShallowEqualSelector((state: Redux.IApplicationStore) => state.budget.actuals.loading);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.budget.fringes.deleting,
  (state: Redux.IApplicationStore) => state.budget.fringes.updating,
  (state: Redux.IApplicationStore) => state.budget.fringes.creating,
  (deleting: number[], updating: number[], creating: boolean) =>
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
    dispatch(requestFringesAction());
  }, []);

  return (
    <WrapInApplicationSpinner loading={loading}>
      <BudgetTable<Table.FringeRow, IFringe, IGroup<any>, Http.IFringePayload>
        data={data}
        placeholders={placeholders}
        mapping={FringeMapping}
        selected={selected}
        identifierField={"name"}
        identifierFieldHeader={"Name"}
        search={search}
        onSearch={(value: string) => dispatch(setFringesSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectFringeAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectFringeAction(id))}
        onRowDelete={(row: Table.FringeRow) => dispatch(removeFringeAction(row.id))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateFringeAction(payload))}
        onSelectAll={() => dispatch(selectAllFringesAction())}
        cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
        bodyColumns={[
          {
            field: "name",
            headerName: "Name"
          },
          {
            field: "description",
            headerName: "Description"
          },
          {
            field: "rate",
            headerName: "Rate"
          },
          {
            field: "unit",
            headerName: "Unit"
          },
          {
            field: "cutoff",
            headerName: "Cutoff"
          }
        ]}
      />
    </WrapInApplicationSpinner>
  );
};

export default Fringes;
