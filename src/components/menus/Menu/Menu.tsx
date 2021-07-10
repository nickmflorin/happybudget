import { ReactNode } from "react";
import classNames from "classnames";

export interface MenuProps extends StandardComponentProps {
  readonly children: ReactNode;
}

const Menu = (props: MenuProps): JSX.Element => {
  return (
    <ul className={classNames("menu", props.className)} style={props.style}>
      {props.children}
    </ul>
  );
};

export default Menu;
