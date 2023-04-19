import React, { useMemo } from "react";

import * as api from "api";
import { redux, notifications } from "lib";
import { useConfirmation } from "deprecated/components/notifications";

import DashboardPage, { DashboardPageProps, RenderDashboardPageCardParams } from "./DashboardPage";

export type RenderGenericOwnedCardParams<B extends Model.SimpleBudget | Model.SimpleTemplate> =
  RenderDashboardPageCardParams<B> & {
    readonly deleting: boolean;
    readonly onDelete: (e: MenuItemModelClickEvent) => void;
  };

export type GenericOwnedProps<B extends Model.SimpleBudget | Model.SimpleTemplate> = Omit<
  DashboardPageProps<B>,
  "renderCard"
> & {
  readonly confirmDeleteProps: {
    readonly suppressionKey: string;
    readonly title: string;
  };
  readonly renderCard: (p: RenderGenericOwnedCardParams<B>) => JSX.Element;
  readonly onDeleted: (b: B) => void;
};

const GenericOwned = <B extends Model.SimpleBudget | Model.SimpleTemplate>(
  props: GenericOwnedProps<B>,
): JSX.Element => {
  const {
    isActive: isDeleting,
    removeFromState: setDeleted,
    addToState: setDeleting,
  } = redux.useTrackModelActions([]);

  const deleteBudget = useMemo(
    () => (b: B, e: MenuItemModelClickEvent) => {
      setDeleting(b.id);
      api
        .deleteBudget(b.id)
        .then(() => {
          e.item.closeParentDropdown?.();
          props.onDeleted(b);
        })
        .catch((err: Error) => notifications.internal.handleRequestError(err))
        .finally(() => setDeleted(b.id));
    },
    [setDeleted, props.onDeleted],
  );

  const [confirmModal, confirmBudgetDelete] = useConfirmation<[B, MenuItemModelClickEvent]>({
    okButtonClass: "btn--danger",
    okText: "Delete",
    suppressionKey: props.confirmDeleteProps.suppressionKey,
    detail: "This action is not recoverable, the data will be permanently erased.",
    title: props.confirmDeleteProps.title,
    onConfirmed: (b: B, e: MenuItemModelClickEvent) => deleteBudget(b, e),
  });

  return (
    <React.Fragment>
      <DashboardPage<B>
        {...props}
        renderCard={(params: RenderDashboardPageCardParams<B>) =>
          props.renderCard({
            ...params,
            deleting: isDeleting(params.budget.id),
            onDelete: (e: MenuItemModelClickEvent) => confirmBudgetDelete([params.budget, e]),
          })
        }
      />
      {confirmModal}
    </React.Fragment>
  );
};

export default React.memo(GenericOwned) as typeof GenericOwned;
