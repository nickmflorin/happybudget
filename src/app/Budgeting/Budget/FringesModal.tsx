import React from "react";
import { FringesTable, connectTableToAuthenticatedStore } from "tabling";
import GenericFringesModal from "components/modals/FringesModal";

import { actions, selectors, sagas } from "../store";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type TC = FringesTableContext<Model.Budget, Model.Account | Model.SubAccount, false>;

const ConnectedFringesTable = connectTableToAuthenticatedStore<
  FringesTable.AuthenticatedFringesTableProps<Model.Budget, Model.Account | Model.SubAccount>,
  R,
  M,
  TC,
  Tables.FringeTableStore
>({
  actions: {
    handleEvent: actions.budget.handleFringesTableEventAction,
    loading: actions.budget.loadingFringesAction,
    response: actions.budget.responseFringesAction,
    setSearch: actions.budget.setFringesSearchAction
  },
  createSaga: (t: Table.TableInstance<R, M>) => sagas.budget.createFringesTableSaga(t),
  selector: (c: TC) => (si: Application.Store) => selectors.selectFringesStore(si, c),
  tableId: (c: TC) => `${c.domain}-fringes`
})(FringesTable.AuthenticatedTable);

interface FringesModalProps extends Pick<ModalProps, "open" | "onCancel"> {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly parentType: "account" | "subaccount";
  readonly id: number;
  readonly table: NonNullRef<Table.TableInstance<R, M>>;
}

const FringesModal: React.FC<FringesModalProps> = ({ id, budget, budgetId, open, parentType, table, onCancel }) => (
  <GenericFringesModal open={open} onCancel={onCancel}>
    <ConnectedFringesTable
      budget={budget}
      tableContext={{ budgetId, parentId: id, parentType, domain: "budget", public: false }}
      table={table}
    />
  </GenericFringesModal>
);

export default React.memo(FringesModal);
