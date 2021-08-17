import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, reduce, find } from "lodash";

import { hooks, redux } from "lib";
import { selectors } from "store";

import { WrapInApplicationSpinner } from "components";
import { Portal, BreadCrumbs } from "components/layout";
import { EditContactModal, CreateContactModal } from "components/modals";
import { ActualsTable } from "components/tabling";

import { actions } from "../../store";

const selectActuals = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.actuals.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.actuals.search
);
const selectActualsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.actuals.loading
);

interface ActualsProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const Actuals = ({ budget, budgetId }: ActualsProps): JSX.Element => {
  const [contactToEdit, setContactToEdit] = useState<number | null>(null);
  const [createContactModalVisible, setCreateContactModalVisible] = useState(false);

  const dispatch = useDispatch();
  const loading = useSelector(selectActualsLoading);
  const data = useSelector(selectActuals);
  const search = useSelector(selectTableSearch);
  const contacts = useSelector(selectors.selectContacts);

  useEffect(() => {
    dispatch(actions.budget.actuals.requestActualsAction(null));
    dispatch(actions.budget.actuals.requestSubAccountsTreeAction(null));
  }, []);

  // NOTE: Right now, the total actual value for a budget can differ from totaling the actual
  // rows of the actuals table.  This can occur if the actual is not yet assigned to a
  // subaccount.  For now, we will not worry about that.
  const actualsTableTotal = useMemo(() => {
    return reduce(data, (sum: number, s: Model.Actual) => sum + (s.value || 0), 0);
  }, [hooks.useDeepEqualMemo(data)]);

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
      <WrapInApplicationSpinner loading={loading}>
        <ActualsTable
          loading={loading}
          models={data}
          search={search}
          contacts={contacts}
          menuPortalId={"supplementary-header"}
          onSearch={(value: string) => dispatch(actions.budget.actuals.setActualsSearchAction(value))}
          onChangeEvent={(e: Table.ChangeEvent<Tables.ActualRow, Model.Actual>) =>
            dispatch(actions.budget.actuals.handleTableChangeEventAction(e))
          }
          actualsTableTotal={actualsTableTotal}
          onSubAccountsTreeSearch={(value: string) =>
            dispatch(actions.budget.actuals.setSubAccountsTreeSearchAction(value))
          }
          exportFileName={!isNil(budget) ? `${budget.name}_actuals` : "actuals"}
          onNewContact={() => setCreateContactModalVisible(true)}
          onEditContact={(id: number) => setContactToEdit(id)}
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
      </WrapInApplicationSpinner>
    </React.Fragment>
  );
};

export default Actuals;
