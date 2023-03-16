import React from "react";

import GenericFringesModal from "components/modals/FringesModal";
import { FringesTable, connectTableToAuthenticatedStore } from "tabling";

import { actions, selectors, sagas } from "../store";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type TC = FringesTableContext<Model.Template, Model.Account | Model.SubAccount, false>;

const ConnectedFringesTable = connectTableToAuthenticatedStore<
  FringesTable.AuthenticatedFringesTableProps<Model.Template, Model.Account | Model.SubAccount>,
  R,
  M,
  TC,
  Tables.FringeTableStore
>({
  actions: {
    handleEvent: actions.template.handleFringesTableEventAction,
    loading: actions.template.loadingFringesAction,
    response: actions.template.responseFringesAction,
    setSearch: actions.template.setFringesSearchAction,
  },
  createSaga: (t: Table.TableInstance<R, M>) => sagas.template.createFringesTableSaga(t),
  selector: (c: TC) => (si: Application.Store) => selectors.selectFringesStore(si, c),
  tableId: (c: TC) => `${c.domain}-fringes`,
})(FringesTable.AuthenticatedTable);

interface FringesModalProps extends Pick<ModalProps, "open" | "onCancel"> {
  readonly budgetId: number;
  readonly budget: Model.Template | null;
  readonly parentType: "account" | "subaccount";
  readonly id: number;
  readonly table: NonNullRef<Table.TableInstance<R, M>>;
}

const FringesModal: React.FC<FringesModalProps> = ({
  id,
  budget,
  budgetId,
  open,
  parentType,
  table,
  onCancel,
}) => (
  <GenericFringesModal open={open} onCancel={onCancel}>
    <ConnectedFringesTable
      budget={budget}
      tableContext={{ budgetId, parentId: id, parentType, domain: "template", public: false }}
      table={table}
    />
  </GenericFringesModal>
);

export default React.memo(FringesModal);
