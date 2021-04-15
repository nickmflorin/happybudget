import { ReactNode } from "react";
import classNames from "classnames";

interface ContentProps extends StandardComponentProps {
  children: ReactNode;
}

const Content = ({ children, className, style = {} }: ContentProps): JSX.Element => {
  return (
    <div className={classNames("content", className)} style={style}>
      <div className={"sub-content"}>{children}</div>
      <div className={"drawer-wrapper"} id={"drawer-target"}></div>
    </div>
  );
};

export default Content;
