import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ShowHide, TooltipWrapper } from "components";

export type LinkProps = StandardComponentWithChildrenProps &
  ClickableProps &
  React.LinkHTMLAttributes<HTMLAnchorElement>;

/**
 * A consistently styled <a> component with functionality allowing the link to
 * include icons, be disabled and other features.
 */
const Link = ({ className, children, tooltip, icon, disabled, ...props }: LinkProps): JSX.Element => (
  <TooltipWrapper {...tooltip}>
    <a
      {...props}
      className={classNames("link", className, {
        disabled: disabled === true && isNil(tooltip),
        "fake-disabled": disabled === true && !isNil(tooltip)
      })}
    >
      <ShowHide show={!isNil(icon)}>{icon}</ShowHide>
      {children}
    </a>
  </TooltipWrapper>
);

export default Link;
