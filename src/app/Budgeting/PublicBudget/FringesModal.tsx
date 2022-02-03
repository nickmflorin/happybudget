import { FringesTable, connectTableToPublicStore } from "tabling";
import GenericFringesModal from "components/modals/FringesModal";

import { actions, selectors } from "../store";

const ConnectedFringesTable = connectTableToPublicStore<
  FringesTable.PublicFringesTableProps<Model.Budget>,
  Tables.FringeRowData,
  Model.Fringe,
  Tables.FringeTableStore,
  Tables.FringeTableContext
>({
  actions: {
    loading: actions.budget.loadingFringesAction,
    response: actions.budget.responseFringesAction,
    setSearch: actions.budget.setFringesSearchAction
  },
  tableId: "public-budget-fringes"
})(FringesTable.PublicTable);

interface FringesModalProps extends Pick<ModalProps, "open" | "onCancel"> {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly parentType: "account" | "subaccount";
  readonly id: number;
  readonly table: NonNullRef<Table.TableInstance<Tables.FringeRowData, Model.Fringe>>;
}

const FringesModal: React.FC<FringesModalProps> = ({ id, budget, budgetId, open, parentType, table, onCancel }) => {
  return (
    <GenericFringesModal open={open} onCancel={onCancel}>
      <ConnectedFringesTable
        budget={budget}
        domain={"budget"}
        actionContext={{ budgetId, id }}
        table={table}
        selector={(si: Application.Store) =>
          selectors.selectFringesStore(si, { parentType, domain: "budget", public: true })
        }
      />
    </GenericFringesModal>
  );
};

export default FringesModal;
