import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";
import { Spinner } from "components";
import "./IconOrSpinner.scss";

interface IconOrSpinnerProps {
  hide?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  [key: string]: any;
}

const IconOrSpinner = ({
  hide,
  loading,
  icon,
  className,
  size = 14,
  style = {},
  ...props
}: IconOrSpinnerProps): JSX.Element => {
  style.height = `${size}px`;
  style.width = `${size}.px`;

  if (hide === true) {
    return <div className={classNames("icon-or-spinner", className)} style={style} {...props}></div>;
  } else if (loading === true) {
    return (
      <div className={classNames("icon-or-spinner", className)} style={style} {...props}>
        <div className={"spinner-wrapper"}>
          <Spinner size={size} />
        </div>
      </div>
    );
  } else if (!isNil(icon)) {
    return (
      <div className={classNames("icon-or-spinner", className)} style={style} {...props}>
        <div className={"icon-wrapper"}>{icon}</div>
      </div>
    );
  } else {
    // We allow the icon to be null just in case we want to use this component
    // as a smaller spinner to the left of text.
    return <div className={classNames("icon-or-spinner", className)} style={style} {...props}></div>;
  }
};

export default IconOrSpinner;
