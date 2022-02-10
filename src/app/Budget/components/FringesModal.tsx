import { isNil } from "lodash";

import { FringesTable, connectTableToStore } from "tabling";
import GenericFringesModal from "components/modals/FringesModal";

import { actions, selectors, sagas } from "../store";

const ConnectedFringesTable = connectTableToStore<
  FringesTable.Props,
  Tables.FringeRowData,
  Model.Fringe,
  Tables.FringeTableStore,
  Tables.FringeTableContext
>({
  actions: {
    tableChanged: actions.handleFringesTableChangeEventAction,
    loading: actions.loadingFringesAction,
    response: actions.responseFringesAction,
    addModelsToState: actions.addFringeModelsToStateAction,
    setSearch: actions.setFringesSearchAction
  },
  createSaga: (table: Table.TableInstance<Tables.FringeRowData, Model.Fringe>) => sagas.createFringesTableSaga(table)
})(FringesTable.Table);

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
        tableId={"budget-fringes"}
        actionContext={{ budgetId, id }}
        table={table}
        exportFileName={!isNil(budget) ? `${budget.name}_fringes` : "fringes"}
        selector={(si: Application.Store) => selectors.selectFringesStore(si, parentType)}
      />
    </GenericFringesModal>
  );
};

export default FringesModal;
