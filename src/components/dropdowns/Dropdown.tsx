import React, { useMemo, useState, useImperativeHandle } from "react";
import classNames from "classnames";
import ClickAwayListener from "react-click-away-listener";
import { uniqueId, isNil } from "lodash";

import { Dropdown as AntdDropdown } from "antd";
import { DropDownProps as AntdDropdownProps } from "antd/lib/dropdown";

import { util } from "lib";

export interface DropdownProps extends Omit<AntdDropdownProps, "overlay" | "visible"> {
  readonly overlayId?: string;
  readonly onClickAway?: (e: MouseEvent | TouchEvent) => void;
  readonly children: React.ReactChild | React.ReactChild[];
  readonly overlay: React.ReactElement | (() => React.ReactElement);
  readonly dropdown?: NonNullRef<IDropdownRef>;
}

const Dropdown = ({ onClickAway, children, overlay, overlayId, dropdown, ...props }: DropdownProps): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const _overlayId = useMemo(() => (!isNil(overlayId) ? overlayId : uniqueId("dropdown-overlay-")), [overlayId]);
  const buttonId = useMemo(() => uniqueId("dropdown-button-"), []);

  useImperativeHandle(dropdown, () => ({
    setVisible
  }));

  return (
    <AntdDropdown
      {...props}
      visible={visible}
      className={classNames("dropdown", props.className)}
      trigger={props.trigger || ["click"]}
      overlay={
        <ClickAwayListener
          onClickAway={(e: MouseEvent | TouchEvent) => {
            /* react-click-away-listener does a pretty shitty job of weeding out
               click events inside the element that it's ClickAwayListener
               component wraps.
               Note that this logic falls apart if a custom overlay is being
               used. */
            const overlayElement = document.getElementById(_overlayId);
            if (
              !isNil(overlayElement) &&
              !isNil(e.target) &&
              util.html.isNodeDescendantOf(overlayElement, e.target as Element | HTMLElement)
            ) {
              return;
            }
            /* Since the dropdown button (props.children) is rendered outside
               of the menu (where the ClickAway is detected), clicking the
               button will also trigger the ClickAway, so we need to avoid it. */
            const button = document.getElementById(buttonId);
            if (!isNil(button) && !util.html.isNodeDescendantOf(button, e.target as Element | HTMLElement)) {
              setVisible(false);
              onClickAway?.(e);
            }
          }}
        >
          <React.Fragment>
            {/* If the overlay ID is explicitly provided, it is up to the developer
						to assign that ID to the overlay element passed into this component. */}
            {React.Children.only(overlay) && React.isValidElement(overlay) && isNil(overlayId)
              ? React.cloneElement(overlay, { id: _overlayId })
              : overlay}
          </React.Fragment>
        </ClickAwayListener>
      }
    >
      {React.Children.only(children) && React.isValidElement(children)
        ? React.cloneElement(children, { id: buttonId, onClick: () => setVisible(!visible) })
        : children}
    </AntdDropdown>
  );
};

export default React.memo(Dropdown) as typeof Dropdown;
