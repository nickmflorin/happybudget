import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import classNames from "classnames";

import { CellClassParams } from "ag-grid-community";

import { WrapInApplicationSpinner } from "components/display";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { FringeUnitModelsList } from "lib/model";
import { FringeMapping } from "lib/tabling/mappings";
import { processOptionModelCellForClipboard } from "lib/tabling/processor";
import { percentageToDecimalValueSetter, optionModelValueSetter } from "lib/tabling/valueSetters";
import { percentageValueFormatter } from "lib/tabling/formatters";

import { setInstanceAction, addFringesPlaceholdersToStateAction } from "./store/actions";
import {
  setFringesSearchAction,
  deselectFringeAction,
  selectFringeAction,
  removeFringeAction,
  updateFringeAction,
  selectAllFringesAction,
  bulkUpdateBudgetFringesAction
} from "./store/actions/fringes";
import BudgetTable from "./BudgetTable";

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
      <BudgetTable<Table.FringeRow, IFringe, IGroup<any>, Http.IFringePayload>
        data={data}
        placeholders={placeholders}
        mapping={FringeMapping}
        selected={selected}
        identifierField={"name"}
        identifierFieldHeader={"Name"}
        tableFooterIdentifierValue={null}
        indexColumn={{ width: 40, maxWidth: 50 }}
        search={search}
        onSearch={(value: string) => dispatch(setFringesSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addFringesPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectFringeAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectFringeAction(id))}
        onRowDelete={(row: Table.FringeRow) => dispatch(removeFringeAction(row.id))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateFringeAction(payload))}
        onRowBulkUpdate={(changes: Table.RowChange[]) => dispatch(bulkUpdateBudgetFringesAction(changes))}
        onSelectAll={() => dispatch(selectAllFringesAction(null))}
        cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
        processCellForClipboard={processOptionModelCellForClipboard<Table.FringeRow, FringeUnitOptionModel>(
          "unit",
          FringeUnitModelsList
        )}
        processors={[
          { field: "rate", type: "http", func: (value: number | null) => (value !== null ? value / 100 : null) }
        ]}
        bodyColumns={[
          {
            field: "description",
            headerName: "Description"
          },
          {
            field: "rate",
            headerName: "Rate",
            valueFormatter: percentageValueFormatter,
            valueSetter: percentageToDecimalValueSetter<Table.FringeRow>("rate")
          },
          {
            field: "unit",
            headerName: "Unit",
            cellClass: classNames("cell--centered"),
            cellRenderer: "FringeUnitCell",
            width: 50,
            valueSetter: optionModelValueSetter<Table.FringeRow, FringeUnitOptionModel>("unit", FringeUnitModelsList)
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
