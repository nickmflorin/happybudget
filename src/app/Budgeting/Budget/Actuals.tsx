import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil, reduce } from "lodash";

import { redux, tabling } from "lib";
import { ActualsTable, connectTableToAuthenticatedStore } from "tabling";

import { ActualsPage } from "../Pages";
import { actions, sagas } from "../store";
import { ActualsPreviewModal } from "./PreviewModals";

type R = Tables.ActualRowData;
type M = Model.Actual;

const selectActualTypes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Store) => state.budget.actuals.types
);

const ConnectedActualsTable = connectTableToAuthenticatedStore<
  ActualsTable.Props,
  R,
  M,
  Tables.ActualTableStore,
  Tables.ActualTableContext
>({
  actions: {
    tableChanged: actions.budget.actuals.handleTableChangeEventAction,
    loading: actions.budget.actuals.loadingAction,
    response: actions.budget.actuals.responseAction,
    setSearch: actions.budget.actuals.setSearchAction
  },
  tableId: "budget-actuals",
  createSaga: (table: Table.TableInstance<R, M>) => sagas.budget.actuals.createTableSaga(table),
  selector: redux.selectors.simpleDeepEqualSelector((state: Application.Store) => state.budget.actuals),
  footerRowSelectors: {
    footer: createSelector(
      (state: Application.Store) => state.budget.actuals.data,
      (rows: Table.BodyRow<Tables.ActualRowData>[]) => {
        return {
          value: reduce(
            rows,
            (sum: number, s: Table.BodyRow<Tables.ActualRowData>) =>
              tabling.typeguards.isModelRow(s) ? sum + (s.data.value || 0) : sum,
            0
          )
        };
      }
    )
  }
})(ActualsTable.Table);

interface ActualsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Actuals = ({ budget, budgetId }: ActualsProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();
  const actualTypes = useSelector(selectActualTypes);

  useEffect(() => {
    dispatch(actions.budget.actuals.requestAction(null, { budgetId }));
  }, [budgetId]);

  return (
    <ActualsPage budget={budget}>
      <React.Fragment>
        <ConnectedActualsTable
          parent={budget}
          table={table}
          actionContext={{ budgetId }}
          actualTypes={actualTypes}
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
