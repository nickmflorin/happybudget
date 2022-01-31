import { useState } from "react";
import { Link, LinkProps } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { ui } from "lib";
import { TooltipWrapper } from "components/tooltips";

export type RouterLinkProps = LinkProps &
  StandardComponentProps &
  ClickableProps & {
    readonly dark?: boolean;
  };

/**
 * A consistently styled react-router Link component that provides additional
 * functionality, like disabling, tooltips and icon inclusion.
 */
const RouterLink = ({ className, children, tooltip, icon, disabled, dark, ...props }: RouterLinkProps): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);
  const prefix = ui.hooks.useClickableIcon(icon, { isHovered });

  return (
    <TooltipWrapper tooltip={tooltip}>
      <Link
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
      </Link>
    </TooltipWrapper>
  );
};

export default RouterLink;
