import { ReactNode } from "react";
import classNames from "classnames";
import { Dropdown } from "antd";

import { FieldsMenu } from "components/menus";
import { FieldsMenuProps } from "components/menus/FieldsMenu";

interface FieldsDropdownProps extends FieldsMenuProps {
  children: ReactNode;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
}

const FieldsDropdown = ({ className, children, trigger = ["click"], ...props }: FieldsDropdownProps): JSX.Element => {
  return (
    <Dropdown
      className={classNames("fields-dropdown", className)}
      trigger={trigger}
      overlay={<FieldsMenu {...props} />}
    >
      {children}
    </Dropdown>
  );
};

export default FieldsDropdown;
