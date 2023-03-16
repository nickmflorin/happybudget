import React, { ReactNode } from "react";

import classNames from "classnames";

interface VerticalFlexCenterProps extends StandardComponentProps {
  children: ReactNode;
}

const VerticalFlexCenter: React.FC<VerticalFlexCenterProps> = ({
  children,
  className,
  style = {},
}) => (
  <div
    className={classNames("vertical-flex-c", className)}
    style={{
      ...style,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export default React.memo(VerticalFlexCenter);
