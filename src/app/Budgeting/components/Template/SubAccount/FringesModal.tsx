import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { redux } from "lib";

import { actions } from "../../../store";
import GenericFringesModal, { GenericFringesModalProps } from "../../GenericFringesModal";

const selectData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.StoreObj) => state.budget.template.subaccount.table.fringes.data
);
const selectTableSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.StoreObj) => state.budget.template.subaccount.table.fringes.search
);
const selectLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.StoreObj) => state.budget.template.subaccount.table.fringes.loading
);
const selectSaving = createSelector(
  (state: Modules.Authenticated.StoreObj) => state.budget.template.subaccount.table.fringes.deleting,
  (state: Modules.Authenticated.StoreObj) => state.budget.template.subaccount.table.fringes.updating,
  (state: Modules.Authenticated.StoreObj) => state.budget.template.subaccount.table.fringes.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);

interface FringesModalProps extends Pick<GenericFringesModalProps, "open" | "onCancel"> {
  readonly template: Model.Template | undefined;
}

const FringesModal: React.FC<FringesModalProps> = ({ template, open, onCancel }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const data = useSelector(selectData);
  const search = useSelector(selectTableSearch);

  const saving = useSelector(selectSaving);

  useEffect(() => {
    // TODO: It might not be necessary to always refresh the Fringes when the modal opens, but it is
    // safer for now to rely on the API as a source of truth more often than not.
    if (open === true) {
      dispatch(actions.template.subAccount.requestFringesAction(null));
    }
  }, [open]);

  return (
    <GenericFringesModal
      exportFileName={!isNil(template) ? `${template.name}_fringes` : "fringes"}
      open={open}
      onCancel={onCancel}
      loading={loading}
      models={data}
      search={search}
      onSearch={(value: string) => dispatch(actions.template.subAccount.setFringesSearchAction(value))}
      saving={saving}
      onChangeEvent={(e: Table.ChangeEvent<Tables.FringeRow, Model.Fringe>) =>
        dispatch(actions.template.subAccount.handleFringesTableChangeEventAction(e))
      }
    />
  );
};

export default FringesModal;
