import React from "react";

import { ui } from "lib";

import { EditPublicTokenMenu } from "components/menus";
import { EditPublicTokenMenuProps } from "components/menus/EditPublicTokenMenu";

import Dropdown, { DropdownProps } from "./Dropdown";

export type EditPublicTokenDropdownProps = Pick<DropdownProps, "className" | "placement" | "children" | "overlayId"> &
  EditPublicTokenMenuProps & {
    readonly menuClassName?: string;
    readonly menuStyle?: React.CSSProperties;
    readonly menuId?: string;
  };

const EditPublicTokenDropdown = ({
  menuClassName,
  menuStyle,
  className,
  placement,
  ...props
}: EditPublicTokenDropdownProps): JSX.Element => {
  const overlayId = ui.hooks.useId("public-token-overlay-");
  return (
    <Dropdown
      className={className}
      placement={placement}
      overlayId={overlayId}
      destroyPopupOnHide={true}
      overlay={<EditPublicTokenMenu {...props} id={overlayId} className={menuClassName} style={menuStyle} />}
    >
      {props.children}
    </Dropdown>
  );
};

export default React.memo(EditPublicTokenDropdown) as typeof EditPublicTokenDropdown;
