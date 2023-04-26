import classNames from "classnames";

import * as ui from "lib/ui/types";

export type HeaderProps = ui.ComponentProps & {
  readonly children: JSX.Element | JSX.Element[];
};

export const Header = (props: HeaderProps): JSX.Element => (
  <header {...props} className={classNames("header", props.className)}>
    {props.children}
  </header>
);
