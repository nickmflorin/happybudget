import React, { useState, useEffect } from "react";

import { isNil, map, reduce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

import { redux, tabling } from "lib";
import * as store from "store";
import { ActualsTable, connectTableToAuthenticatedStore } from "tabling";

import { ActualsPreviewModal } from "./PreviewModals";
import { ActualsPage } from "../Pages";
import { actions, sagas } from "../store";

type R = Tables.ActualRowData;
type M = Model.Actual;
type TC = ActualsTableActionContext;

const ConnectedActualsTable = connectTableToAuthenticatedStore<
  ActualsTable.Props,
  R,
  M,
  TC,
  Tables.ActualTableStore
>({
  actions: {
    handleEvent: actions.budget.actuals.handleTableEventAction,
    loading: actions.budget.actuals.loadingAction,
    response: actions.budget.actuals.responseAction,
    setSearch: actions.budget.actuals.setSearchAction,
  },
  tableId: () => "budget-actuals",
  createSaga: (table: Table.TableInstance<R, M>) => sagas.budget.actuals.createTableSaga(table),
  selector: () => redux.simpleDeepEqualSelector((state: Application.Store) => state.budget.actuals),
  footerRowSelectors: {
    footer: createSelector(
      (state: Application.Store) => state.budget.actuals.data,
      (rows: Table.BodyRow<Tables.ActualRowData>[]) => ({
        value: reduce(
          rows,
          (sum: number, s: Table.BodyRow<Tables.ActualRowData>) =>
            tabling.rows.isModelRow(s) ? sum + (s.data.value || 0) : sum,
          0,
        ),
      }),
    ),
  },
})(ActualsTable.Table);

interface ActualsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Actuals = ({ budget, budgetId }: ActualsProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const actualTypes = useSelector(store.selectors.selectActualTypes);

  useEffect(() => {
    dispatch(actions.budget.actuals.requestAction(null, { budgetId }));
  }, [budgetId]);

  return (
    <ActualsPage budget={budget}>
      <React.Fragment>
        <ConnectedActualsTable
          parent={budget}
          table={table}
          tableContext={{ budgetId }}
          actualTypes={actualTypes}
          onImportSuccess={(b: Model.Budget, ms: Model.Actual[]) => {
            dispatch(actions.budget.updateBudgetInStateAction({ id: b.id, data: b }, {}));
            table.current.dispatchEvent({
              type: "modelsAdded",
              payload: map(ms, (m: Model.Actual) => ({ model: m })),
            });
          }}
          onOwnersSearch={(value: string) =>
            dispatch(actions.budget.actuals.setActualOwnersSearchAction(value, { budgetId }))
          }
          onExportPdf={() => setPreviewModalVisible(true)}
        />
        {!isNil(budget) && (
          <ActualsPreviewModal
            open={previewModalVisible}
            onCancel={() => setPreviewModalVisible(false)}
            budgetId={budgetId}
            budget={budget}
            filename={!isNil(budget) ? `${budget.name}_actuals.pdf` : "budget_actuals.pdf"}
          />
        )}
      </React.Fragment>
    </ActualsPage>
  );
};

export default Actuals;
