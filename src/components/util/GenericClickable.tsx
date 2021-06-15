import { ElementType, ReactNode } from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { TooltipPropsWithTitle } from "antd/lib/tooltip";

import { TooltipWrapper } from "components";

interface GenericClickableProps extends StandardComponentProps {
  disabled?: boolean;
  tooltip?: Partial<TooltipPropsWithTitle>;
  component: ElementType;
  icon?: JSX.Element;
  children?: ReactNode;
}

/**
 * A generic wrapper class that provides common functionality for all clickable
 * links and buttons.  The provided component class will be wrapped in the common
 * behavior to provide a consistently styled link component that allows disabling,
 * icons and other functionality.
 */
const GenericClickable = ({
  children,
  tooltip,
  disabled = false,
  icon,
  component,
  ...props
}: GenericClickableProps): JSX.Element => {
  const ClickableBase: ElementType = component;
  if (!isNil(icon)) {
    return (
      <TooltipWrapper {...tooltip}>
        <ClickableBase {...props} className={classNames(props.className, { disabled: disabled })}>
          {icon}
          {children}
        </ClickableBase>
      </TooltipWrapper>
    );
  } else {
    return (
      <TooltipWrapper {...tooltip}>
        <ClickableBase {...props} className={classNames(props.className, { disabled: disabled })}>
          {children}
        </ClickableBase>
      </TooltipWrapper>
    );
  }
};

export default GenericClickable;
