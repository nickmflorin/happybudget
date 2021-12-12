import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil, filter, reduce } from "lodash";

import { redux, tabling } from "lib";
import { actions as globalActions, selectors } from "store";

import { ActualsPage } from "app/Pages";

import { useContacts, CreateContactParams } from "components/hooks";
import { ActualsTable, connectTableToStore } from "components/tabling";

import { actions } from "../store";

type R = Tables.ActualRowData;
type M = Model.Actual;

const selectActualTypes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.actuals.types
);

const ConnectedActualsTable = connectTableToStore<ActualsTable.ActualsTableProps, R, M, Tables.ActualTableStore>({
  actions: {
    tableChanged: actions.actuals.handleTableChangeEventAction,
    request: actions.actuals.requestAction,
    loading: actions.actuals.loadingAction,
    response: actions.actuals.responseAction,
    saving: actions.actuals.savingTableAction,
    addModelsToState: actions.actuals.addModelsToStateAction,
    setSearch: actions.actuals.setSearchAction
  },
  selector: redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.actuals),
  footerRowSelectors: {
    footer: createSelector(
      redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.actuals.data),
      (rows: Table.BodyRow<Tables.ActualRowData>[]) => {
        return {
          value: reduce(rows, (sum: number, s: Table.BodyRow<Tables.ActualRowData>) => sum + (s.data.value || 0), 0)
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
  const dispatch = useDispatch();
  const contacts = useSelector(selectors.selectContacts);
  const table = tabling.hooks.useTable<R>();
  const actualTypes = useSelector(selectActualTypes);

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
          let rowChange: Table.RowChange<R> = {
            id: row.id,
            data: { contact: { oldValue: row.data.contact || null, newValue: m.id } }
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
          contacts={contacts}
          actualTypes={actualTypes}
          onOwnersSearch={(value: string) => dispatch(actions.actuals.setActualOwnersSearchAction(value))}
          exportFileName={!isNil(budget) ? `${budget.name}_actuals` : "actuals"}
          onNewContact={(params: { name?: string; rowId: Table.ModelRowId }) => createContact(params)}
          onEditContact={(params: { contact: number; rowId: Table.ModelRowId }) =>
            editContact({ id: params.contact, rowId: params.rowId })
          }
          onSearchContact={(v: string) => dispatch(globalActions.authenticated.setContactsSearchAction(v))}
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
      </React.Fragment>
    </ActualsPage>
  );
};

export default Actuals;
