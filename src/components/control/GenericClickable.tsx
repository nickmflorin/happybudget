import { ElementType } from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { TooltipPropsWithTitle } from "antd/lib/tooltip";

import { IconWrapper, TooltipWrapper } from "components/display";

interface GenericClickableProps {
  className?: string;
  disabled?: boolean;
  tooltip?: Partial<TooltipPropsWithTitle>;
  component: ElementType;
  icon?: JSX.Element;
  iconColor?: string;
  iconLocation?: "left" | "right";
  [key: string]: any; // These get passed through to the generic HTML element.
}

/**
 * A generic wrapper class that provides common functionality for all clickable
 * links and buttons.  The provided component class will be wrapped in the common
 * behavior to provide a consistently styled link component that allows disabling,
 * icons and other functionality.
 */
const GenericClickable = ({
  children,
  className,
  tooltip,
  disabled = false,
  iconLocation = "left",
  iconColor,
  icon,
  component,
  ...props
}: GenericClickableProps): JSX.Element => {
  const ClickableBase: ElementType = component;
  if (!isNil(icon)) {
    if (iconLocation === "right") {
      return (
        <TooltipWrapper {...tooltip}>
          <ClickableBase {...props} className={classNames(className, { disabled: disabled })}>
            {children}
            <IconWrapper icon={icon} className={classNames({ right: !isNil(children) })} color={iconColor} />
          </ClickableBase>
        </TooltipWrapper>
      );
    } else {
      // The default behavior will be to put the icon to the left of the body.
      return (
        <TooltipWrapper {...tooltip}>
          <ClickableBase {...props} className={classNames(className, { disabled: disabled })}>
            <IconWrapper icon={icon} className={classNames({ left: !isNil(children) })} color={iconColor} />
            {children}
          </ClickableBase>
        </TooltipWrapper>
      );
    }
  } else {
    return (
      <TooltipWrapper {...tooltip}>
        <ClickableBase {...props} className={classNames(className, { disabled: disabled })}>
          {children}
        </ClickableBase>
      </TooltipWrapper>
    );
  }
};

export default GenericClickable;
