import { FringesTable, connectTableToAuthenticatedStore } from "tabling";
import GenericFringesModal from "components/modals/FringesModal";

import { actions, selectors, sagas } from "../store";

const ConnectedFringesTable = connectTableToAuthenticatedStore<
  FringesTable.AuthenticatedFringesTableProps<Model.Template>,
  Tables.FringeRowData,
  Model.Fringe,
  Tables.FringeTableStore,
  Tables.FringeTableContext
>({
  actions: {
    tableChanged: actions.template.handleFringesTableChangeEventAction,
    loading: actions.template.loadingFringesAction,
    response: actions.template.responseFringesAction,
    setSearch: actions.template.setFringesSearchAction
  },
  tableId: "template-fringes",
  createSaga: (table: Table.TableInstance<Tables.FringeRowData, Model.Fringe>) =>
    sagas.template.createFringesTableSaga(table)
})(FringesTable.AuthenticatedTable);

interface FringesModalProps extends Pick<ModalProps, "open" | "onCancel"> {
  readonly budgetId: number;
  readonly budget: Model.Template | null;
  readonly parentType: "account" | "subaccount";
  readonly id: number;
  readonly table: NonNullRef<Table.TableInstance<Tables.FringeRowData, Model.Fringe>>;
}

const FringesModal: React.FC<FringesModalProps> = ({ id, budget, budgetId, open, parentType, table, onCancel }) => {
  return (
    <GenericFringesModal open={open} onCancel={onCancel}>
      <ConnectedFringesTable
        budget={budget}
        domain={"template"}
        actionContext={{ budgetId, id }}
        table={table}
        selector={(si: Application.Store) => selectors.selectFringesStore(si, { parentType, domain: "budget" })}
      />
    </GenericFringesModal>
  );
};

export default FringesModal;
