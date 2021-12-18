import React, { ReactNode, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import { useDispatch } from "react-redux";
import classNames from "classnames";
import { isNil } from "lodash";

import { util } from "lib";
import { setDrawerVisibilityAction } from "store/actions";
import Portal from "./Portal";

interface DrawerSectionProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  noPadding?: boolean;
}

export const DrawerContent = ({
  children,
  className,
  noPadding = false,
  style = {}
}: DrawerSectionProps): JSX.Element => {
  return (
    <div className={classNames("drawer-content", className, { "no-padding": noPadding })} style={style}>
      {children}
    </div>
  );
};

export const DrawerFooter = ({
  children,
  className,
  noPadding = false,
  style = {}
}: DrawerSectionProps): JSX.Element => {
  return (
    <div className={classNames("drawer-footer", className, { "no-padding": noPadding })} style={style}>
      {children}
    </div>
  );
};

interface DrawerProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  visible: boolean;
  onClickAway?: () => void;
}

const Drawer = ({ children, className, visible, style = {}, onClickAway }: DrawerProps): JSX.Element => {
  const dispatch: Redux.Dispatch = useDispatch();

  useEffect(() => {
    dispatch(setDrawerVisibilityAction(visible));
  }, [visible]);

  return (
    <Portal id={"drawer-target"} visible={visible}>
      <ClickAwayListener
        onClickAway={(event: MouseEvent | TouchEvent) => {
          /* When there are elements that trigger the opening/closing of a drawer,
             they must be attributed with [role="drawer-toggle"].  This way, those
             elements will not trigger a click away. */
          let ignoreClick = false;
          /* eslint-disable quotes */
          document.querySelectorAll('[role="drawer-toggle"]').forEach((el: Element) => {
            if (!isNil(event.srcElement) && util.html.isNodeDescendantOf(el, event.srcElement as HTMLElement)) {
              ignoreClick = true;
              return false;
            }
          });
          if (ignoreClick === false && !isNil(onClickAway)) {
            onClickAway();
          }
        }}
      >
        <div className={classNames("drawer", className)} style={style}>
          {children}
        </div>
      </ClickAwayListener>
    </Portal>
  );
};

Drawer.Content = DrawerContent;
Drawer.Footer = DrawerFooter;

export default Drawer;
