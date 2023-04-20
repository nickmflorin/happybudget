import classNames from "classnames";

import { ui } from "lib";

// import { Sidebar } from "../Sidebar";

import { Main } from "./Main";

export type LayoutProps = ui.ComponentProps & { readonly children: JSX.Element };

/**
 * A component that represents the overall application layout.
 */
export const Layout = (props: LayoutProps): JSX.Element => (
  <div {...props} className={classNames("layout", props.className)}>
    {/* <Sidebar /> */}
    <Main>{props.children}</Main>
  </div>
);
