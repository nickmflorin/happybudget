import React, { useMemo, useState } from "react";

import * as api from "api";
import { http, notifications } from "lib";
import { Icon } from "components";

import BaseBudgetCard, { BaseBudgetCardProps } from "./BaseBudgetCard";

export type GenericTemplateCardProps = BaseBudgetCardProps<Model.SimpleTemplate> & {
  readonly deleting: boolean;
  readonly onEdit: () => void;
  readonly onEditNameImage: () => void;
  readonly onDelete: (e: MenuItemModelClickEvent) => void;
  readonly onDuplicated: (response: Model.Template) => void;
};

const GenericTemplateCard = ({
  deleting,
  onDuplicated,
  onEditNameImage,
  onEdit,
  onDelete,
  ...props
}: GenericTemplateCardProps): JSX.Element => {
  const [duplicating, setDuplicating] = useState(false);
  const [cancelToken] = http.useCancelToken();

  const duplicate = useMemo(
    () => (e: MenuItemModelClickEvent) => {
      setDuplicating(true);
      api
        /* We have to use a large timeout because this is a request that
					 sometimes takes a very long time. */
        .duplicateBudget<Model.Template>(props.budget.id, {
          timeout: 120 * 1000,
          cancelToken: cancelToken(),
        })
        .then((response: Model.Template) => {
          e.item.closeParentDropdown?.();
          setDuplicating(false);
          onDuplicated(response);
        })
        .catch((err: Error) => {
          setDuplicating(false);
          notifications.ui.banner.handleRequestError(err);
        });
    },
    [onDuplicated, props.budget.id],
  );

  return (
    <BaseBudgetCard
      {...props}
      disabled={props.disabled || duplicating}
      dropdown={[
        {
          id: "edit",
          label: "Edit",
          icon: <Icon icon="edit" weight="light" />,
          onClick: () => onEdit(),
        },
        {
          id: "edit_name_image",
          label: "Edit Name/Image",
          icon: <Icon icon="image" weight="light" />,
          onClick: () => onEditNameImage(),
        },
        {
          id: "duplicate",
          label: "Duplicate",
          icon: <Icon icon="clone" weight="light" />,
          onClick: (e: MenuItemModelClickEvent) => duplicate(e),
          keepDropdownOpenOnClick: true,
          loading: duplicating,
          disabled: duplicating,
        },
        {
          id: "delete",
          label: "Delete",
          icon: <Icon icon="trash" weight="light" />,
          onClick: (e: MenuItemModelClickEvent) => onDelete(e),
          keepDropdownOpenOnClick: true,
          loading: deleting,
          disabled: deleting,
        },
        ...(props.dropdown || []),
      ]}
    />
  );
};

export default React.memo(GenericTemplateCard);
