import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil, reduce } from "lodash";

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
  setSearch: actions.actuals.setSearchAction,
  clear: actions.actuals.clearAction
};

const ConnectedActualsTable = connectTableToStore<ActualsTable.Props, R, M, Tables.ActualTableStore>({
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
        onOwnerTreeSearch={(value: string) => dispatch(actions.actuals.setOwnerTreeSearchAction(value))}
        exportFileName={!isNil(budget) ? `${budget.name}_actuals` : "actuals"}
        onNewContact={() => setCreateContactModalVisible(true)}
        onEditContact={(id: number) => setContactToEdit(id)}
      />
      {!isNil(contactToEdit) && (
        <EditContactModal
          open={true}
          id={contactToEdit}
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
