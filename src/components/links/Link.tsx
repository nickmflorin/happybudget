import React, { useState } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ui } from "lib";
import { TooltipWrapper } from "components";

export type LinkProps = StandardComponentWithChildrenProps &
  ClickableProps &
  React.LinkHTMLAttributes<HTMLAnchorElement>;

/**
 * A consistently styled <a> component with functionality allowing the link to
 * include icons, be disabled and other features.
 */
const Link = ({ className, children, tooltip, icon, disabled, ...props }: LinkProps): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);
  const prefix = ui.hooks.useClickableIcon(icon, { isHovered });

  return (
    <TooltipWrapper tooltip={tooltip}>
      <a
        {...props}
        className={classNames("link", className, {
          disabled: disabled === true && isNil(tooltip),
          "fake-disabled": disabled === true && !isNil(tooltip)
        })}
        onMouseEnter={() => setIsHovered(!isHovered)}
        onMouseLeave={() => setIsHovered(!isHovered)}
      >
        {prefix}
        {children}
      </a>
    </TooltipWrapper>
  );
};

export default React.memo(Link);
