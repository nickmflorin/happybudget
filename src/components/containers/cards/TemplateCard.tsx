import React, { useMemo, useState } from "react";

import * as api from "api";
import * as store from "store";
import { http, notifications } from "lib";

import { Icon } from "components";

import GenericTemplateCard, { GenericTemplateCardProps } from "./GenericTemplateCard";

type TemplateCardProps = Omit<GenericTemplateCardProps, "dropdown"> & {
  readonly onMoved: (response: Model.Template) => void;
};

const TemplateCard = ({ onMoved, ...props }: TemplateCardProps): JSX.Element => {
  const [moving, setMoving] = useState(false);

  const user = store.hooks.useLoggedInUser();
  const [cancelToken] = http.useCancelToken();

  const move = useMemo(
    () => (e: MenuItemModelClickEvent) => {
      setMoving(true);
      api
        .updateBudget<Model.Template>(props.budget.id, { community: true }, { cancelToken: cancelToken() })
        .then((response: Model.Template) => {
          e.item.closeParentDropdown?.();
          setMoving(false);
          onMoved(response);
        })
        .catch((err: Error) => {
          setMoving(false);
          notifications.internal.handleRequestError(err);
        });
    },
    [onMoved, props.budget.id]
  );

  return (
    <GenericTemplateCard
      {...props}
      style={{ height: 194 }}
      disabled={props.disabled || moving}
      includeSubTitle={false}
      dropdown={[
        {
          id: "move",
          label: "Move to Community",
          icon: <Icon icon={"user-friends"} weight={"solid"} />,
          onClick: (e: MenuItemModelClickEvent) => move(e),
          keepDropdownOpenOnClick: true,
          visible: user.is_staff === true,
          loading: moving,
          disabled: moving
        }
      ]}
    />
  );
};

export default React.memo(TemplateCard);
