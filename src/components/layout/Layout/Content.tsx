import classNames from "classnames";

import { ui } from "lib";

export type ContentProps = ui.ComponentProps<{ readonly children: JSX.Element }>;

/**
 * A component that represents the content to the right of the <Sidebar /> and underneath the
 * <Header /> in the overall application layout.
 */
export const Content = (props: ContentProps): JSX.Element => (
  <div {...props} className={classNames("content", props.className)}>
    {props.children}
  </div>
);
