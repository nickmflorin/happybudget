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
    saving: actions.savingFringesTableAction,
    addModelsToState: actions.addFringeModelsToStateAction,
    setSearch: actions.setFringesSearchAction
  },
  createSaga: (table: Table.TableInstance<Tables.FringeRowData, Model.Fringe>) => sagas.createFringesTableSaga(table),
  selector: selectors.selectFringesStore
})(FringesTable.Table);

interface FringesModalProps extends Pick<ModalProps, "open" | "onCancel"> {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly id: number; // ID of Account or SubAccount
}

const FringesModal: React.FC<FringesModalProps> = ({ id, budget, budgetId, open, onCancel }) => {
  return (
    <GenericFringesModal open={open} onCancel={onCancel}>
      <ConnectedFringesTable
        tableId={"budget-fringes"}
        actionContext={{ budgetId, id }}
        exportFileName={!isNil(budget) ? `${budget.name}_fringes` : "fringes"}
      />
    </GenericFringesModal>
  );
};

export default FringesModal;
