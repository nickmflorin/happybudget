import React, { ReactNode } from "react";
import classNames from "classnames";

export interface MenuItemProps extends StandardComponentProps {
  readonly children: ReactNode;
  readonly onClick: (e: React.MouseEvent<HTMLLIElement>) => void;
}

const MenuItem = (props: MenuItemProps): JSX.Element => {
  return (
    <li className={classNames("menu-item", props.className)} style={props.style} onClick={props.onClick} id={props.id}>
      {props.children}
    </li>
  );
};

export default MenuItem;
