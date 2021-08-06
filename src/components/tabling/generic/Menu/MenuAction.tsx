import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button, IconButton } from "components/buttons";

interface TableMenuActionProps {
  readonly action: Table.MenuAction;
  // For the buttons to properly work when included in a Dropdown, we need to expose
  // the onClick prop such that AntD can automatically set this prop on the action.
  readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const InnerTableMenuAction = ({ action, ...props }: TableMenuActionProps): JSX.Element => {
  if (!isNil(action.render)) {
    return action.render();
  } else if (!isNil(action.text)) {
    return (
      <Button
        // If the button is being wrapped in a dropdown, we need to allow the onClick prop that AntD sets
        // on the Button when it is nested in a Dropdown to persist.
        onClick={isNil(action.wrapInDropdown) ? () => !isNil(action.onClick) && action.onClick() : props.onClick}
        className={"btn--bare btn--budget-table-menu"}
        disabled={action.disabled}
        icon={<FontAwesomeIcon className={"icon"} icon={action.icon} />}
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
            : {}
        }
      >
        {action.text}
      </Button>
    );
  } else {
    return (
      <IconButton
        className={"green-hover"}
        size={"large"}
        onClick={() => !isNil(action.onClick) && action.onClick()}
        disabled={action.disabled}
        icon={<FontAwesomeIcon className={"icon"} icon={action.icon} />}
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
            : {}
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
