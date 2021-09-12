import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil, find, reduce } from "lodash";

import { redux } from "lib";
import { selectors } from "store";

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
  setSearch: actions.actuals.setSearchAction
};

const ConnectedActualsTable = connectTableToStore<ActualsTable.Props, R, M, Model.Group, Tables.ActualTableStore>({
  actions: ActionMap,
  selector: redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.actuals),
  footerRowSelectors: {
    footer: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.actuals.data)],
      (data: Table.Row<Tables.ActualRowData, Model.Actual>[]) => ({
        value: reduce(data, (sum: number, s: Tables.ActualRowData) => sum + (s.value || 0), 0)
      })
    )
  }
})(ActualsTable.Table);

interface ActualsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const Actuals = ({ budget, budgetId }: ActualsProps): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<ID | null>(null);
  const [createContactModalVisible, setCreateContactModalVisible] = useState(false);

  const dispatch = useDispatch();
  const contacts = useSelector(selectors.selectContacts);

  const editingContact = useMemo(() => {
    if (!isNil(contactToEdit)) {
      const contact: Model.Contact | undefined = find(contacts, { id: contactToEdit } as any);
      if (!isNil(contact)) {
        return contact;
      } else {
        /* eslint-disable no-console */
        console.error(`Could not find contact with ID ${contactToEdit} in state.`);
        return null;
      }
    }
    return null;
  }, [contactToEdit]);

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
        contacts={contacts}
        onSubAccountsTreeSearch={(value: string) => dispatch(actions.actuals.setSubAccountsTreeSearchAction(value))}
        exportFileName={!isNil(budget) ? `${budget.name}_actuals` : "actuals"}
        onNewContact={() => setCreateContactModalVisible(true)}
        onEditContact={(id: ID) => setContactToEdit(id)}
      />
      {!isNil(editingContact) && (
        <EditContactModal
          visible={true}
          contact={editingContact}
          onSuccess={() => setContactToEdit(null)}
          onCancel={() => setContactToEdit(null)}
        />
      )}
      <CreateContactModal
        visible={createContactModalVisible}
        onSuccess={() => setCreateContactModalVisible(false)}
        onCancel={() => setCreateContactModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default Actuals;
