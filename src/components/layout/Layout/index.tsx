import { ReactNode } from "react";

import classNames from "classnames";

import * as ui from "lib/ui/types";

import { Main } from "./Main";

export type LayoutProps = ui.ComponentProps & {
  readonly children: ReactNode;
  readonly sidebar?: JSX.Element;
  readonly header: JSX.Element;
};

export const Layout = ({ header, sidebar, children, ...props }: LayoutProps): JSX.Element => (
  <div {...props} className={classNames("layout", props.className)}>
    {sidebar !== undefined && <div className="sidebar-container">{sidebar}</div>}
    <Main header={header}>{children}</Main>
  </div>
);
