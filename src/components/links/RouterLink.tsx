import { Link, LinkProps } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { ShowHide, TooltipWrapper } from "components";

export type RouterLinkProps = LinkProps & StandardComponentProps & ClickableProps;

/**
 * A consistently styled react-router Link component that provides additional
 * functionality, like disabling, tooltips and icon inclusion.
 */
const RouterLink = ({ className, children, tooltip, icon, disabled, ...props }: RouterLinkProps): JSX.Element => (
  <TooltipWrapper tooltip={tooltip}>
    <Link
      {...props}
      className={classNames("link", className, {
        disabled: disabled === true && isNil(tooltip),
        "fake-disabled": disabled === true && !isNil(tooltip)
      })}
    >
      <ShowHide show={!isNil(icon)}>{icon}</ShowHide>
      {children}
    </Link>
  </TooltipWrapper>
);

export default RouterLink;
