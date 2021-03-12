import React, { ReactNode, useEffect } from "react";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import classNames from "classnames";
import { setDrawerVisibilityAction } from "store/actions";
import Portal from "./Portal";

interface DrawerSectionProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  noPadding?: boolean;
}

interface DrawerProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  visible: boolean;
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

const Drawer = ({ children, className, visible, style = {} }: DrawerProps): JSX.Element => {
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    dispatch(setDrawerVisibilityAction(visible));
  }, [visible]);

  return (
    <Portal id={"drawer-target"} visible={visible}>
      <div className={classNames("drawer", className)} style={style}>
        {children}
      </div>
    </Portal>
  );
};

Drawer.Content = DrawerContent;
Drawer.Footer = DrawerFooter;

export default Drawer;
