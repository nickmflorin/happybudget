import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { isNil, includes, map } from "lodash";
import classNames from "classnames";
import { createSelector } from "reselect";

import { ColDef, ColSpanParams } from "ag-grid-community";

import { CreateSubAccountGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { floatValueSetter, integerValueSetter } from "util/table";

import BudgetTable from "../../BudgetTable";
import { selectBudgetId } from "../selectors";
import {
  addPlaceholdersAction,
  deselectSubAccountAction,
  removeSubAccountAction,
  selectSubAccountAction,
  setSubAccountsSearchAction,
  updateSubAccountAction,
  selectAllSubAccountsAction,
  deleteGroupAction,
  addGroupToTableAction
} from "./actions";

const selectTableData = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table.search
);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.deleting,
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.updating,
  (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.creating,
  (deleting: number[], updating: number[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.account.detail.data
);

const AccountBudgetTable = (): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);

  const { accountId } = useParams<{ budgetId: string; accountId: string }>();
  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const table = useSelector(selectTableData);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const accountDetail = useSelector(selectAccountDetail);

  return (
    <React.Fragment>
      <BudgetTable<Table.SubAccountRow, ISubAccountNestedGroup, ISimpleSubAccount>
        table={table}
        identifierField={"identifier"}
        identifierFieldHeader={"Line"}
        isCellEditable={(row: Table.SubAccountRow, colDef: ColDef) => {
          if (includes(["estimated", "actual", "unit", "variance"], colDef.field)) {
            return false;
          } else if (includes(["identifier", "description", "name"], colDef.field)) {
            return true;
          } else {
            return !isNil(row.meta) && row.meta.children.length === 0;
          }
        }}
        highlightNonEditableCell={(row: Table.SubAccountRow, colDef: ColDef) => {
          return !includes(["quantity", "multiplier", "rate", "unit"], colDef.field);
        }}
        search={search}
        onSearch={(value: string) => dispatch(setSubAccountsSearchAction(value))}
        saving={saving}
        rowRefreshRequired={(existing: Table.SubAccountRow, row: Table.SubAccountRow) => existing.unit !== row.unit}
        onRowAdd={() => dispatch(addPlaceholdersAction(1))}
        onRowSelect={(id: number) => dispatch(selectSubAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectSubAccountAction(id))}
        onRowDelete={(row: Table.SubAccountRow) => dispatch(removeSubAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateSubAccountAction(payload))}
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        groupParams={{
          onDeleteGroup: (group: ISubAccountNestedGroup) => dispatch(deleteGroupAction(group.id)),
          onGroupRows: (rows: Table.SubAccountRow[]) =>
            setGroupSubAccounts(map(rows, (row: Table.SubAccountRow) => row.id))
        }}
        onSelectAll={() => dispatch(selectAllSubAccountsAction())}
        totals={{
          estimated: !isNil(accountDetail) && !isNil(accountDetail.estimated) ? accountDetail.estimated : 0.0,
          variance: !isNil(accountDetail) && !isNil(accountDetail.variance) ? accountDetail.variance : 0.0,
          actual: !isNil(accountDetail) && !isNil(accountDetail.actual) ? accountDetail.actual : 0.0
        }}
        bodyColumns={[
          {
            field: "description",
            headerName: "Category Description",
            flex: 100,
            colSpan: (params: ColSpanParams) => {
              // Not totally sure why this conditional is necessary, but it's necessity might
              // be a symptom of another problem.  We should investigate.
              if (
                !isNil(params.node) &&
                params.node.group === false &&
                !isNil(params.data.meta) &&
                !isNil(params.data.meta.children)
              ) {
                return !isNil(params.data) && !isNil(params.data.meta) && params.data.meta.children.length !== 0
                  ? 6
                  : 1;
              }
              return 1;
            }
          },
          {
            field: "name",
            headerName: "Name",
            width: 15
          },
          {
            field: "quantity",
            headerName: "Quantity",
            width: 10,
            cellStyle: { textAlign: "right" },
            valueSetter: integerValueSetter("quantity")
          },
          {
            field: "unit",
            headerName: "Unit",
            cellClass: classNames("cell--centered", "cell--not-editable-bordered"),
            cellRenderer: "UnitCell",
            width: 20,
            cellRendererParams: {
              onChange: (unit: Unit, row: Table.SubAccountRow) =>
                dispatch(
                  updateSubAccountAction({
                    id: row.id,
                    data: {
                      unit: {
                        oldValue: row.unit,
                        newValue: unit
                      }
                    }
                  })
                )
            }
          },
          {
            field: "multiplier",
            headerName: "X",
            width: 10,
            cellStyle: { textAlign: "right" },
            valueSetter: floatValueSetter("multiplier")
          },
          {
            field: "rate",
            headerName: "Rate",
            width: 10,
            cellStyle: { textAlign: "right" },
            valueSetter: floatValueSetter("rate")
          }
        ]}
        calculatedColumns={[
          {
            field: "estimated",
            headerName: "Estimated"
          },
          {
            field: "actual",
            headerName: "Actual"
          },
          {
            field: "variance",
            headerName: "Variance"
          }
        ]}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={parseInt(accountId)}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: ISubAccountGroup) => {
            setGroupSubAccounts(undefined);
            dispatch(
              addGroupToTableAction({
                group: { id: group.id, color: group.color, name: group.name },
                ids: map(group.subaccounts, (subaccount: ISimpleSubAccount) => subaccount.id)
              })
            );
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
    </React.Fragment>
  );
};

export default AccountBudgetTable;
