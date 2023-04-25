import classNames from "classnames";

import { config } from "application";
import { ui } from "lib";

export type TabBarProps = ui.ComponentProps;

export const TabBar = (props: TabBarProps): JSX.Element => (
  <div className={classNames("tab-bar", props.className)}></div>
);
