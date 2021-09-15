import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ui } from "lib";

import { Icon } from "components";
import { Button, IconButton } from "components/buttons";

interface TableMenuActionProps extends StandardComponentProps {
  readonly action: Table.MenuActionObj;
  // For the buttons to properly work when included in a Dropdown, we need to expose
  // the onClick prop such that AntD can automatically set this prop on the action.
  readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const InnerTableMenuAction = ({ action, ...props }: TableMenuActionProps): JSX.Element => {
  if (!isNil(action.render)) {
    return action.render();
  } else if (!isNil(action.label)) {
    return (
      <Button
        {...props}
        // If the button is being wrapped in a dropdown, we need to allow the onClick prop that AntD sets
        // on the Button when it is nested in a Dropdown to persist.
        onClick={isNil(action.wrapInDropdown) ? () => !isNil(action.onClick) && action.onClick() : props.onClick}
        className={classNames("btn--bare btn--budget-table-menu", props.className)}
        disabled={action.disabled}
        icon={ui.typeguards.iconIsJSX(action.icon) ? action.icon : <Icon icon={action.icon} />}
        tooltip={
          /* eslint-disable indent */
          !isNil(action.tooltip)
            ? typeof action.tooltip === "string"
              ? {
                  title: action.tooltip,
                  placement: "bottom",
                  overlayClassName: classNames({ disabled: action.disabled === true })
                }
              : {
                  placement: "bottom",
                  ...action.tooltip,
                  overlayClassName: classNames({ disabled: action.disabled === true }, action.tooltip.overlayClassName)
                }
            : undefined
        }
      >
        {action.label}
      </Button>
    );
  } else {
    return (
      <IconButton
        className={"green-hover"}
        onClick={() => !isNil(action.onClick) && action.onClick()}
        disabled={action.disabled}
        icon={ui.typeguards.iconIsJSX(action.icon) ? action.icon : <Icon icon={action.icon} />}
        tooltip={
          /* eslint-disable indent */
          !isNil(action.tooltip)
            ? typeof action.tooltip === "string"
              ? {
                  title: action.tooltip,
                  placement: "bottom",
                  overlayClassName: classNames({ disabled: action.disabled === true })
                }
              : {
                  placement: "bottom",
                  ...action.tooltip,
                  overlayClassName: classNames({ disabled: action.disabled === true }, action.tooltip.overlayClassName)
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

export default TableMenuAction;
