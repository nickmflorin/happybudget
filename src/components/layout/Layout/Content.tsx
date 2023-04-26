import { ReactNode } from "react";

import classNames from "classnames";

import * as ui from "lib/ui/types";

export type ContentProps = ui.ComponentProps<{ readonly children: ReactNode }>;

/**
 * A component that represents the content to the right of the <Sidebar /> and underneath the
 * <Header /> in the overall application layout.
 */
export const Content = (props: ContentProps): JSX.Element => (
  <div {...props} className={classNames("content", props.className)}>
    <div className="content-viewport">{props.children}</div>
  </div>
);
