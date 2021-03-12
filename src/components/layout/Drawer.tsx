import React, { ReactNode } from "react";
import classNames from "classnames";

interface DrawerContentProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  noPadding?: boolean;
}

interface DrawerProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const DrawerContent = ({
  children,
  className,
  noPadding = false,
  style = {}
}: DrawerContentProps): JSX.Element => {
  return (
    <div className={classNames("drawer-content", className, { "no-padding": noPadding })} style={style}>
      {children}
    </div>
  );
};

const Drawer = ({ children, className, style = {} }: DrawerProps): JSX.Element => {
  return (
    <div className={classNames("drawer", className)} style={style}>
      {children}
    </div>
  );
};

Drawer.Content = DrawerContent;

export default Drawer;
