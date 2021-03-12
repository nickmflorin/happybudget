import React, { ReactNode } from "react";
import classNames from "classnames";
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
