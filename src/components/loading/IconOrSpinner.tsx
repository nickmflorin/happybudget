import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ui } from "lib";
import { Icon } from "components";
import { withSize } from "components/hocs";

import Spinner, { SpinnerProps } from "./Spinner";

import "./IconOrSpinner.scss";

interface IconOrSpinnerProps extends UseSizeProps {
  readonly loading?: boolean;
  readonly icon?: IconOrElement;
  readonly spinnerProps?: SpinnerProps;
  readonly style?: React.CSSProperties;
  readonly className?: string;
}

/**
 * @deprecated
 */
const IconOrSpinner = ({ loading, icon, spinnerProps, ...props }: IconOrSpinnerProps): JSX.Element => {
  if (loading === true) {
    return (
      <div {...props} className={classNames("icon-or-spinner", props.className)}>
        <div className={"spinner-wrapper"}>
          <Spinner {...spinnerProps} />
        </div>
      </div>
    );
  } else if (!isNil(icon)) {
    return (
      <div {...props} className={classNames("icon-or-spinner", props.className)}>
        <div className={"icon-wrapper"}>{ui.typeguards.iconIsJSX(icon) ? icon : <Icon icon={icon} />}</div>
      </div>
    );
  } else {
    /* We allow the icon to be null just in case we want to use this component
       as a smaller spinner to the left of text. */
    return <div {...props} className={classNames("icon-or-spinner", props.className)}></div>;
  }
};

export default withSize<IconOrSpinnerProps>()(React.memo(IconOrSpinner));
