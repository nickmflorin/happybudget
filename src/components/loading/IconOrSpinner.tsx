import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ui } from "lib";
import { Spinner, Icon } from "components";

import "./IconOrSpinner.scss";

interface IconOrSpinnerProps extends StandardComponentProps {
  loading?: boolean;
  icon?: IconOrElement;
  size?: number;
  [key: string]: any;
}

const IconOrSpinner = ({ loading, icon, className, size = 14, style = {} }: IconOrSpinnerProps): JSX.Element => {
  style.height = `${size}px`;
  style.width = `${size}px`;

  if (loading === true) {
    return (
      <div className={classNames("icon-or-spinner", className)} style={style}>
        <div className={"spinner-wrapper"}>
          <Spinner size={size} />
        </div>
      </div>
    );
  } else if (!isNil(icon)) {
    return (
      <div className={classNames("icon-or-spinner", className)} style={style}>
        <div className={"icon-wrapper"}>{ui.typeguards.iconIsJSX(icon) ? icon : <Icon icon={icon} />}</div>
      </div>
    );
  } else {
    /* We allow the icon to be null just in case we want to use this component
       as a smaller spinner to the left of text. */
    return <div className={classNames("icon-or-spinner", className)} style={style}></div>;
  }
};

export default React.memo(IconOrSpinner);
