import React, { useMemo } from "react";
import { useDispatch } from "react-redux";

import * as api from "api";
import * as store from "store";
import { redux, notifications } from "lib";

import { useConfirmation } from "components/notifications";
import Generic, { GenericProps, RenderGenericCardParams } from "./Generic";

export type RenderUserCardParams = RenderGenericCardParams<Model.SimpleBudget> & {
  readonly deleting: boolean;
  readonly onDelete: (e: MenuItemModelClickEvent) => void;
};

type UserGenericProps = Omit<GenericProps<Model.SimpleBudget>, "renderCard"> & {
  readonly renderCard: (p: RenderUserCardParams) => JSX.Element;
  readonly onDeleted: (b: Model.SimpleBudget) => void;
};

const UserGeneric = (props: UserGenericProps): JSX.Element => {
  const user = store.hooks.useLoggedInUser();
  const { isActive: isDeleting, removeFromState: setDeleted, addToState: setDeleting } = redux.useTrackModelActions([]);
  const dispatch: Redux.Dispatch = useDispatch();

  const deleteBudget = useMemo(
    () => (b: Model.SimpleBudget, e: MenuItemModelClickEvent) => {
      setDeleting(b.id);
      api
        .deleteBudget(b.id)
        .then(() => {
          e.item.closeParentDropdown?.();
          dispatch(
            store.actions.updateLoggedInUserAction({
              ...user,
              num_budgets: Math.max(user.num_budgets - 1, 0)
            })
          );
          props.onDeleted(b);
        })
        .catch((err: Error) => notifications.internal.handleRequestError(err))
        .finally(() => setDeleted(b.id));
    },
    [setDeleted, props.onDeleted]
  );

  const [confirmModal, confirmBudgetDelete] = useConfirmation<[Model.SimpleBudget, MenuItemModelClickEvent]>({
    okButtonClass: "btn--danger",
    okText: "Delete",
    suppressionKey: "delete-budget-confirmation-suppressed",
    detail: "This action is not recoverable, the data will be permanently erased.",
    title: "Delete Budget",
    onConfirmed: (b: Model.SimpleBudget, e: MenuItemModelClickEvent) => deleteBudget(b, e)
  });

  return (
    <React.Fragment>
      <Generic
        {...props}
        renderCard={(params: RenderGenericCardParams<Model.SimpleBudget>) =>
          props.renderCard({
            ...params,
            deleting: isDeleting(params.budget.id),
            onDelete: (e: MenuItemModelClickEvent) => confirmBudgetDelete([params.budget, e])
          })
        }
      />
      {confirmModal}
    </React.Fragment>
  );
};

export default UserGeneric;
