import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

interface IconWrapperProps {
  className?: string;
  style?: React.CSSProperties;
  color?: string;
  icon: JSX.Element;
}

const IconWrapper = ({ className, style = {}, color, icon }: IconWrapperProps): JSX.Element => {
  if (!isNil(color)) {
    style.color = color;
  }
  return (
    <span className={classNames("icon-wrapper", className)} style={style}>
      {icon}
    </span>
  );
};

export default IconWrapper;
