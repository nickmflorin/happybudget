import { Link as ReactLink } from "react-router-dom";
import classNames from "classnames";
import { GenericClickable } from "components/util";

interface RouterLinkProps {
  className?: string;
  [key: string]: any;
}

/**
 * A consistently styled react-router Link component that provides additional
 * functionality, like disabling, tooltips and icon inclusion.
 */
const RouterLink = ({ className, ...props }: RouterLinkProps): JSX.Element => (
  <GenericClickable className={classNames("link", className)} component={ReactLink} {...props} />
);

export default RouterLink;
