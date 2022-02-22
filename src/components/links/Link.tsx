import React, { useState } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ui } from "lib";
import { TooltipWrapper } from "components/tooltips";

export type LinkProps = StandardComponentWithChildrenProps &
  ClickableProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "onMouseEnter" | "onMouseLeave"> & {
    readonly dark?: boolean;
  };

const Link = ({ className, children, tooltip, icon, disabled, dark, ...props }: LinkProps): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);
  const prefix = ui.hooks.useClickableIcon(icon, { isHovered });

  return (
    <TooltipWrapper tooltip={tooltip}>
      <a
        {...props}
        className={classNames("link", className, {
          disabled: disabled === true && isNil(tooltip),
          "link--dark": dark,
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
