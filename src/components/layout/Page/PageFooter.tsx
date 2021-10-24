import React from "react";
import classNames from "classnames";

const PageFooter: React.FC<StandardComponentWithChildrenProps> = (props): JSX.Element => {
  return (
    <div {...props} className={classNames("page-footer", props.className)}>
      {props.children}
    </div>
  );
};

export default PageFooter;
