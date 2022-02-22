import React, { ReactNode } from "react";
import classNames from "classnames";

interface ContentProps extends StandardComponentProps {
  readonly children: ReactNode;
}

const Content = ({ children, ...props }: ContentProps): JSX.Element => (
  <div {...props} className={classNames("content", props.className)}>
    <div className={"sub-content"}>{children}</div>
  </div>
);

export default React.memo(Content);
