import React from "react";

import GenericFringesModal from "components/modals/FringesModal";
import { FringesTable, connectTableToPublicStore } from "deprecated/components/tabling";

import { actions, selectors } from "../store";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type TC = FringesTableContext<Model.Budget, Model.Account | Model.SubAccount, true>;

const ConnectedFringesTable = connectTableToPublicStore<
  FringesTable.PublicFringesTableProps<Model.Budget, Model.Account | Model.SubAccount>,
  R,
  M,
  TC,
  Tables.FringeTableStore
>({
  actions: {
    loading: actions.pub.loadingFringesAction,
    response: actions.pub.responseFringesAction,
    setSearch: actions.pub.setFringesSearchAction,
  },
  selector: (c: TC) => (si: Application.Store) => selectors.selectFringesStore(si, c),
  tableId: (c: TC) => `pub-${c.domain}-fringes`,
})(FringesTable.PublicTable);

interface FringesModalProps extends Pick<ModalProps, "open" | "onCancel"> {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
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
      tableContext={{ budgetId, parentId: id, parentType, domain: "budget", public: true }}
      table={table}
    />
  </GenericFringesModal>
);

export default React.memo(FringesModal);
