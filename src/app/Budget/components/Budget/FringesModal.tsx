import { isNil } from "lodash";

import { FringesTable, connectTableToStore } from "components/tabling";
import GenericFringesModal, { GenericFringesModalProps } from "components/modals/FringesModal";

import { actions, selectors } from "../../store";

const ConnectedFringesTable = connectTableToStore<
  FringesTable.Props,
  Tables.FringeRowData,
  Model.Fringe,
  Tables.FringeTableStore
>({
  autoRequest: false,
  actions: {
    tableChanged: actions.handleFringesTableChangeEventAction,
    request: actions.requestFringesAction,
    loading: actions.loadingFringesAction,
    response: actions.responseFringesAction,
    saving: actions.savingFringesTableAction,
    addModelsToState: actions.addFringeModelsToStateAction,
    setSearch: actions.setFringesSearchAction,
    clear: actions.clearFringesAction
  },
  selector: selectors.selectFringesStore
})(FringesTable.Table);

interface FringesModalProps extends Pick<GenericFringesModalProps, "open" | "onCancel"> {
  readonly budget: Model.Budget | null;
}

const FringesModal: React.FC<FringesModalProps> = ({ budget, open, onCancel }) => {
  return (
    <GenericFringesModal open={open} onCancel={onCancel}>
      <ConnectedFringesTable exportFileName={!isNil(budget) ? `${budget.name}_fringes` : "fringes"} />
    </GenericFringesModal>
  );
};

export default FringesModal;
