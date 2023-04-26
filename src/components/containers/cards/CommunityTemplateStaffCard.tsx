import React, { useState, useMemo } from "react";
import classNames from "classnames";

import * as api from "api";
import * as store from "store";
import { notifications, http } from "lib";

import { Icon } from "components";

import GenericTemplateCard, { GenericTemplateCardProps } from "./GenericTemplateCard";

type CommunityTemplateStaffCardProps = Omit<GenericTemplateCardProps, "dropdown" | "cornerActions"> & {
  readonly onVisibilityToggled: (b: Model.Template) => void;
};

const CommunityTemplateStaffCard = ({
  onVisibilityToggled,
  ...props
}: CommunityTemplateStaffCardProps): JSX.Element => {
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const user = store.hooks.useLoggedInUser();
  const [cancelToken] = http.useCancelToken();

  const toggleVisibility = useMemo(
    () => (e: MenuItemModelClickEvent) => {
      if (user.is_staff === false) {
        throw new Error("Behavior prohibited for non-staff users.");
      }
      setTogglingVisibility(true);
      if (props.budget.hidden === true) {
        api
          .updateBudget<Model.Template>(props.budget.id, { hidden: false }, { cancelToken: cancelToken() })
          .then((response: Model.Template) => {
            setTogglingVisibility(false);
            e.item.closeParentDropdown?.();
            onVisibilityToggled(response);
          })
          .catch((err: Error) => {
            setTogglingVisibility(false);
            e.item.closeParentDropdown?.();
            notifications.internal.handleRequestError(err);
          });
      } else {
        api
          .updateBudget<Model.Template>(props.budget.id, { hidden: true }, { cancelToken: cancelToken() })
          .then((response: Model.Template) => {
            setTogglingVisibility(false);
            e.item.closeParentDropdown?.();
            onVisibilityToggled(response);
          })
          .catch((err: Error) => {
            setTogglingVisibility(false);
            e.item.closeParentDropdown?.();
            notifications.internal.handleRequestError(err);
          });
      }
    },
    [props.budget.id, props.budget.hidden, onVisibilityToggled]
  );

  return (
    <GenericTemplateCard
      {...props}
      disabled={props.disabled || togglingVisibility}
      className={classNames("community-template-admin-card", props.className, { hidden: props.budget.hidden })}
      cornerActions={(iconClassName: string) => [
        {
          render: () => (
            <Icon
              className={classNames("icon--card-corner-action", iconClassName)}
              icon={"eye-slash"}
              weight={"solid"}
            />
          ),
          visible: props.budget.hidden === true
        }
      ]}
      dropdown={[
        {
          id: "hide_show",
          label: props.budget.hidden === true ? "Show" : "Hide",
          icon: <Icon weight={"solid"} icon={props.budget.hidden === true ? "eye" : "eye-slash"} />,
          onClick: (e: MenuItemModelClickEvent) => toggleVisibility(e),
          loading: togglingVisibility,
          disabled: togglingVisibility
        }
      ]}
    />
  );
};

export default React.memo(CommunityTemplateStaffCard);
