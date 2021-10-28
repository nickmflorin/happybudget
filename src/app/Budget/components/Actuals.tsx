import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil, filter, reduce } from "lodash";

import { redux } from "lib";
import { actions as globalActions, selectors } from "store";

import { Portal, BreadCrumbs } from "components/layout";
import { EditContactModal, CreateContactModal } from "components/modals";
import { ActualsTable, connectTableToStore } from "components/tabling";
import { actions } from "../store";

type R = Tables.ActualRowData;
type M = Model.Actual;

const ActionMap = {
  tableChanged: actions.actuals.handleTableChangeEventAction,
  request: actions.actuals.requestAction,
  loading: actions.actuals.loadingAction,
  response: actions.actuals.responseAction,
  saving: actions.actuals.savingTableAction,
  addModelsToState: actions.actuals.addModelsToStateAction,
  setSearch: actions.actuals.setSearchAction,
  clear: actions.actuals.clearAction
};

const selectActualTypes = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.actuals.actualTypes
);

const ConnectedActualsTable = connectTableToStore<ActualsTable.ActualsTableProps, R, M, Tables.ActualTableStore>({
  actions: ActionMap,
  selector: redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.actuals),
  footerRowSelectors: {
    footer: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.actuals.data)],
      (rows: Table.BodyRow<Tables.ActualRowData>[]) => ({
        value: reduce(rows, (sum: number, s: Table.BodyRow<Tables.ActualRowData>) => sum + (s.data.value || 0), 0)
      })
    )
  }
})(ActualsTable.Table);

interface ActualsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const Actuals = ({ budget, budgetId }: ActualsProps): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<number | null>(null);
  const [createContactModalVisible, setCreateContactModalVisible] = useState(false);

  const dispatch = useDispatch();
  const contacts = useSelector(selectors.selectContacts);
  const actualTypes = useSelector(selectActualTypes);

  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          items={[
            {
              id: "actuals",
              primary: true,
              label: "Actuals Log",
              tooltip: { title: "Actuals Log", placement: "bottom" }
            }
          ]}
        />
      </Portal>
      <ConnectedActualsTable
        tableId={"actuals-table"}
        contacts={contacts}
        actualTypes={actualTypes}
        onOwnerTreeSearch={(value: string) => dispatch(actions.actuals.setOwnerTreeSearchAction(value))}
        exportFileName={!isNil(budget) ? `${budget.name}_actuals` : "actuals"}
        onNewContact={() => setCreateContactModalVisible(true)}
        onEditContact={(params: { contact: number; id: Table.EditableRowId }) => setContactToEdit(params.contact)}
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
      {!isNil(contactToEdit) && (
        <EditContactModal
          open={true}
          id={contactToEdit}
          onSuccess={(m: Model.Contact) => {
            dispatch(globalActions.authenticated.updateContactInStateAction({ id: m.id, data: m }));
            setContactToEdit(null);
          }}
          onCancel={() => setContactToEdit(null)}
        />
      )}
      <CreateContactModal
        open={createContactModalVisible}
        onSuccess={(m: Model.Contact) => {
          dispatch(globalActions.authenticated.addContactToStateAction(m));
          setCreateContactModalVisible(false);
        }}
        onCancel={() => setCreateContactModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default Actuals;
