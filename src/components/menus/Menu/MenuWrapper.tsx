import { ReactNode } from "react";
import classNames from "classnames";

export interface MenuWrapperProps extends StandardComponentWithChildrenProps {
  readonly children: ReactNode;
}

const MenuWrapper = (props: MenuWrapperProps): JSX.Element => {
  return (
    <div className={classNames("menu-wrapper", props.className)} style={props.style}>
      {props.children}
    </div>
  );
};

export default MenuWrapper;
