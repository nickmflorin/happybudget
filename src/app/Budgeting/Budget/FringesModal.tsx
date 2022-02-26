import React from "react";
import { FringesTable, connectTableToAuthenticatedStore } from "tabling";
import GenericFringesModal from "components/modals/FringesModal";

import { actions, selectors, sagas } from "../store";

const ConnectedFringesTable = connectTableToAuthenticatedStore<
  FringesTable.AuthenticatedFringesTableProps<Model.Budget>,
  Tables.FringeRowData,
  Model.Fringe,
  Tables.FringeTableStore,
  Tables.FringeTableContext
>({
  actions: {
    tableChanged: actions.budget.handleFringesTableEventAction,
    loading: actions.budget.loadingFringesAction,
    response: actions.budget.responseFringesAction,
    setSearch: actions.budget.setFringesSearchAction
  },
  tableId: "budget-fringes"
})(FringesTable.AuthenticatedTable);

interface FringesModalProps extends Pick<ModalProps, "open" | "onCancel"> {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly parentType: "account" | "subaccount";
  readonly id: number;
  readonly table: NonNullRef<Table.TableInstance<Tables.FringeRowData, Model.Fringe>>;
}

const FringesModal: React.FC<FringesModalProps> = ({ id, budget, budgetId, open, parentType, table, onCancel }) => (
  <GenericFringesModal open={open} onCancel={onCancel}>
    <ConnectedFringesTable
      budget={budget}
      domain={"budget"}
      actionContext={{ budgetId, id }}
      table={table}
      createSaga={(t: Table.TableInstance<Tables.FringeRowData, Model.Fringe>) =>
        sagas.budget.createFringesTableSaga(t, parentType)
      }
      selector={(si: Application.Store) => selectors.selectFringesStore(si, { parentType, domain: "budget" })}
    />
  </GenericFringesModal>
);

export default React.memo(FringesModal);
