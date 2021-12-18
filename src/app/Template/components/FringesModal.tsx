import { isNil } from "lodash";

import { FringesTable, connectTableToStore } from "tabling";
import GenericFringesModal from "components/modals/FringesModal";

import { actions, selectors, sagas } from "../store";

const ConnectedFringesTable = connectTableToStore<
  FringesTable.Props,
  Tables.FringeRowData,
  Model.Fringe,
  Tables.FringeTableStore
>({
  createSaga: (table: Table.TableInstance<Tables.FringeRowData, Model.Fringe>) => sagas.createFringesTableSaga(table),
  onSagaConnected: (dispatch: Redux.Dispatch, c: Tables.FringeTableContext) =>
    dispatch(actions.requestFringesAction(null, c)),
  actions: {
    tableChanged: actions.handleFringesTableChangeEventAction,
    loading: actions.loadingFringesAction,
    response: actions.responseFringesAction,
    saving: actions.savingFringesTableAction,
    addModelsToState: actions.addFringeModelsToStateAction,
    setSearch: actions.setFringesSearchAction
  },
  selector: selectors.selectFringesStore
})(FringesTable.Table);

interface FringesModalProps extends Pick<ModalProps, "open" | "onCancel"> {
  readonly budget: Model.Template | null;
  readonly budgetId: number;
  readonly id: number;
}

const FringesModal: React.FC<FringesModalProps> = ({ id, budget, budgetId, open, onCancel }) => {
  return (
    <GenericFringesModal open={open} onCancel={onCancel}>
      <ConnectedFringesTable
        actionContext={{ budgetId, id }}
        tableId={"template-fringes"}
        exportFileName={!isNil(budget) ? `${budget.name}_fringes` : "fringes"}
      />
    </GenericFringesModal>
  );
};

export default FringesModal;
