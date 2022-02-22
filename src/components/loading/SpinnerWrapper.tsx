import React from "react";
import classNames from "classnames";

const SpinnerWrapper: React.FC<StandardComponentWithChildrenProps> = ({ children, className, style = {} }) => (
  <div className={classNames("spinner-wrapper", className)} style={style}>
    {children}
  </div>
);

export default React.memo(SpinnerWrapper);
