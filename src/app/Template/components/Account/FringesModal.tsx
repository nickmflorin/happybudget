import { isNil } from "lodash";

import { redux } from "lib";

import { FringesTable, connectTableToStore } from "components/tabling";
import GenericFringesModal, { GenericFringesModalProps } from "components/modals/FringesModal";

import { actions, initialState } from "../../store";

const ActionMap = {
  tableChanged: actions.handleFringesTableChangeEventAction,
  request: actions.requestFringesAction,
  loading: actions.loadingFringesAction,
  response: actions.responseFringesAction,
  saving: actions.savingFringesTableAction,
  addModelsToState: actions.addFringeModelsToStateAction,
  setSearch: actions.setFringesSearchAction,
  clear: actions.clearFringesAction
};

const ConnectedFringesTable = connectTableToStore<
  FringesTable.Props,
  Tables.FringeRowData,
  Model.Fringe,
  Model.Group,
  Tables.FringeTableStore
>({
  actions: ActionMap,
  autoRequest: false,
  selector: (state: Application.Store) =>
    redux.typeguards.isAuthenticatedStore(state)
      ? state.template.account.table.fringes
      : initialState.account.table.fringes
})(FringesTable.Table);

interface FringesModalProps extends Pick<GenericFringesModalProps, "open" | "onCancel"> {
  readonly template: Model.Template | null;
}

const FringesModal: React.FC<FringesModalProps> = ({ template, open, onCancel }) => {
  return (
    <GenericFringesModal open={open} onCancel={onCancel}>
      <ConnectedFringesTable
        tableId={"fringes-table"}
        exportFileName={!isNil(template) ? `${template.name}_fringes` : "fringes"}
      />
    </GenericFringesModal>
  );
};

export default FringesModal;
