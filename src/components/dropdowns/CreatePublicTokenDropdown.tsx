import React from "react";

import { ui } from "lib";

import { CreatePublicTokenMenu } from "components/menus";
import { CreatePublicTokenMenuProps } from "components/menus/CreatePublicTokenMenu";

import Dropdown, { DropdownProps } from "./Dropdown";

export type CreatePublicTokenDropdownProps<M extends Model.PublicHttpModel> = Pick<
  DropdownProps,
  "className" | "placement" | "children" | "overlayId"
> &
  Omit<CreatePublicTokenMenuProps<M>, "id"> & {
    readonly menuClassName?: string;
    readonly menuStyle?: React.CSSProperties;
  };

const CreatePublicTokenDropdown = <M extends Model.PublicHttpModel>({
  menuClassName,
  menuStyle,
  className,
  placement,
  ...props
}: CreatePublicTokenDropdownProps<M>): JSX.Element => {
  const overlayId = ui.hooks.useId("public-token-overlay-");
  return (
    <Dropdown
      className={className}
      placement={placement}
      destroyPopupOnHide={true}
      overlayId={overlayId}
      overlay={<CreatePublicTokenMenu<M> {...props} id={overlayId} className={menuClassName} style={menuStyle} />}
    >
      {props.children}
    </Dropdown>
  );
};

export default React.memo(CreatePublicTokenDropdown) as typeof CreatePublicTokenDropdown;
