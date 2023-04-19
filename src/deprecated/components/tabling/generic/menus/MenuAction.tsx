import React from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { ui } from "lib";
import { Icon } from "components";
import { IconButton, BareButton } from "components/buttonsOld";

interface TableMenuActionProps extends StandardComponentProps {
  readonly action: Table.MenuActionObj;
  /* For the buttons to properly work when included in a Dropdown, we need to
		 expose both the onClick and id prop such that AntD can control the dropdown
		 visibility via the button and the dropdown will close when clicked outside
		 of the overlay. */
  readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const InnerTableMenuAction = ({ action, ...props }: TableMenuActionProps): JSX.Element => {
  if (action.hidden) {
    return <></>;
  } else if (!isNil(action.render)) {
    /* For the buttons to properly work when included in a Dropdown, we need to
		   expose both the onClick and id prop such that AntD can control the dropdown
		   visibility via the button and the dropdown will close when clicked outside
		   of the overlay. */
    return action.render({
      id: props.id,
      onClick: isNil(action.wrapInDropdown)
        ? () => !isNil(action.onClick) && action.onClick()
        : props.onClick,
    });
  } else if (!isNil(action.label)) {
    return (
      <BareButton
        {...props}
        /* If the button is being wrapped in a dropdown, we need to allow the
					 onClick prop that AntD sets on the Button when it is nested in a
					 Dropdown to persist. */
        onClick={
          isNil(action.wrapInDropdown)
            ? () => !isNil(action.onClick) && action.onClick()
            : props.onClick
        }
        className={classNames("budget-table-menu", props.className, { active: action.active })}
        size="medium"
        disabled={action.disabled}
        icon={
          !isNil(action.icon) ? (
            ui.iconIsJSX(action.icon) ? (
              action.icon
            ) : (
              <Icon icon={action.icon} />
            )
          ) : (
            <></>
          )
        }
        tooltip={
          !isNil(action.tooltip)
            ? typeof action.tooltip === "string"
              ? {
                  content: action.tooltip,
                  placement: "bottom",
                  overlayClassName: classNames({ disabled: action.disabled === true }),
                }
              : {
                  placement: "bottom",
                  ...action.tooltip,
                  overlayClassName: classNames(
                    { disabled: action.disabled === true },
                    action.tooltip.overlayClassName,
                  ),
                }
            : undefined
        }
      >
        {action.label}
      </BareButton>
    );
  } else {
    return (
      <IconButton
        className={classNames("green-hover budget-table-menu", { active: action.active })}
        size="medium"
        iconSize="medium"
        onClick={() => !isNil(action.onClick) && action.onClick()}
        disabled={action.disabled}
        icon={
          !isNil(action.icon) ? (
            ui.iconIsJSX(action.icon) ? (
              action.icon
            ) : (
              <Icon icon={action.icon} />
            )
          ) : (
            <></>
          )
        }
        tooltip={
          !isNil(action.tooltip)
            ? typeof action.tooltip === "string"
              ? {
                  content: action.tooltip,
                  placement: "bottom",
                  overlayClassName: classNames({ disabled: action.disabled === true }),
                }
              : {
                  placement: "bottom",
                  ...action.tooltip,
                  overlayClassName: classNames(
                    { disabled: action.disabled === true },
                    action.tooltip.overlayClassName,
                  ),
                }
            : undefined
        }
      />
    );
  }
};

const TableMenuAction = ({ action, ...props }: TableMenuActionProps): JSX.Element => {
  if (!isNil(action.wrapInDropdown)) {
    return action.wrapInDropdown(<InnerTableMenuAction action={action} {...props} />);
  }
  return <InnerTableMenuAction action={action} {...props} />;
};

export default React.memo(TableMenuAction);
