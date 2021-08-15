import React, { useState, useMemo } from "react";
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
const Link = ({ className, children, tooltip, icon, disabled, ...props }: LinkProps): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);

  const prefix = useMemo(() => {
    if (typeof icon == "function") {
      return icon({ isHovered });
    } else {
      return icon;
    }
  }, [isHovered, icon]);

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
        <ShowHide show={!isNil(icon)}>{prefix}</ShowHide>
        {children}
      </a>
    </TooltipWrapper>
  );
};

export default Link;
