import classNames from "classnames";

import * as ui from "lib/ui/types";

export type TabBarProps = ui.ComponentProps;

export const TabBar = (props: TabBarProps): JSX.Element => (
  <div className={classNames("tab-bar", props.className)}></div>
);
