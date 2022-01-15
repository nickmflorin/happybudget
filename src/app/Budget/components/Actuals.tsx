import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil, filter, reduce } from "lodash";

import { redux, tabling, contacts } from "lib";
import { actions as globalActions } from "store";

import { ActualsPage } from "app/Pages";

import { useContacts, CreateContactParams } from "components/hooks";
import { ActualsTable, connectTableToStore } from "tabling";

import { actions, sagas } from "../store";
import { ActualsPreviewModal } from "./PreviewModals";

type R = Tables.ActualRowData;
type M = Model.Actual;

const selectActualTypes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.actuals.types
);

const ConnectedActualsTable = connectTableToStore<
  ActualsTable.ActualsTableProps,
  R,
  M,
  Tables.ActualTableStore,
  Tables.ActualTableContext
>({
  actions: {
    tableChanged: actions.actuals.handleTableChangeEventAction,
    loading: actions.actuals.loadingAction,
    response: actions.actuals.responseAction,
    addModelsToState: actions.actuals.addModelsToStateAction,
    setSearch: actions.actuals.setSearchAction
  },
  createSaga: (table: Table.TableInstance<R, M>) => sagas.actuals.createTableSaga(table),
  selector: redux.selectors.simpleDeepEqualSelector((state: Application.AuthenticatedStore) => state.budget.actuals),
  footerRowSelectors: {
    footer: createSelector(
      (state: Application.AuthenticatedStore) => state.budget.actuals.data,
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
  const cs = contacts.hooks.useContacts();
  const table = tabling.hooks.useTable<R, M>();
  const actualTypes = useSelector(selectActualTypes);

  useEffect(() => {
    dispatch(actions.actuals.requestAction(null, { budgetId }));
  }, [budgetId]);

  const onContactCreated = useMemo(
    () => (m: Model.Contact, params?: CreateContactParams) => {
      dispatch(globalActions.authenticated.addContactToStateAction(m));
      /* If we have enough information from before the contact was created in
				 the specific cell, combine that information with the new value to
				 perform a table update, showing the created contact in the new cell. */
      const rowId = params?.rowId;
      if (!isNil(rowId)) {
        const row: Table.BodyRow<R> | null = table.current.getRow(rowId);
        if (!isNil(row) && tabling.typeguards.isModelRow(row)) {
          const rowChange: Table.RowChange<R> = {
            id: row.id,
            data: { contact: { oldValue: row.data.contact, newValue: m.id } }
          };
          table.current.applyTableChange({
            type: "dataChange",
            payload: rowChange
          });
        }
      }
    },
    [table.current]
  );

  const [createContactModal, editContactModal, editContact, createContact] = useContacts({
    onCreated: onContactCreated,
    onUpdated: (m: Model.Contact) =>
      dispatch(globalActions.authenticated.updateContactInStateAction({ id: m.id, data: m }))
  });

  return (
    <ActualsPage budget={budget}>
      <React.Fragment>
        <ConnectedActualsTable
          table={table}
          actionContext={{ budgetId }}
          tableId={"budget-actuals"}
          contacts={cs}
          actualTypes={actualTypes}
          onOwnersSearch={(value: string) => dispatch(actions.actuals.setActualOwnersSearchAction(value, { budgetId }))}
          exportFileName={!isNil(budget) ? `${budget.name}_actuals` : "actuals"}
          onNewContact={(params: { name?: string; rowId: Table.ModelRowId }) => createContact(params)}
          onEditContact={(params: { contact: number; rowId: Table.ModelRowId }) =>
            editContact({ id: params.contact, rowId: params.rowId })
          }
          onExportPdf={() => setPreviewModalVisible(true)}
          onSearchContact={(v: string) => dispatch(globalActions.authenticated.setContactsSearchAction(v, {}))}
          onAttachmentRemoved={(row: Table.ModelRow<R>, id: number) =>
            dispatch(
              actions.actuals.updateRowsInStateAction({
                id: row.id,
                data: {
                  attachments: filter(row.data.attachments, (a: Model.SimpleAttachment) => a.id !== id)
                }
              })
            )
          }
          onAttachmentAdded={(row: Table.ModelRow<R>, attachment: Model.Attachment) =>
            dispatch(
              actions.actuals.updateRowsInStateAction({
                id: row.id,
                data: {
                  attachments: [
                    ...row.data.attachments,
                    { id: attachment.id, name: attachment.name, extension: attachment.extension, url: attachment.url }
                  ]
                }
              })
            )
          }
        />
        {editContactModal}
        {createContactModal}
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
