import { ReactNode } from "react";
import classNames from "classnames";
import { Dropdown } from "antd";

import { FieldsMenu } from "components/control/menus";
import { FieldsMenuProps } from "components/control/menus/FieldsMenu";

import { CaretButton } from "components/control/buttons";
import { CaretButtonProps } from "components/control/buttons/CaretButton";

interface FieldsDropdownProps extends FieldsMenuProps {
  children: ReactNode;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
  buttonProps?: CaretButtonProps;
}

const FieldsDropdown = ({
  className,
  children,
  trigger = ["click"],
  buttonProps = {},
  ...props
}: FieldsDropdownProps): JSX.Element => {
  return (
    <Dropdown
      className={classNames("fields-dropdown", className)}
      trigger={trigger}
      overlay={<FieldsMenu {...props} />}
    >
      <CaretButton solid {...buttonProps}>
        {children}
      </CaretButton>
    </Dropdown>
  );
};

export default FieldsDropdown;
