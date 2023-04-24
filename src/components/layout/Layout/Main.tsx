import classNames from "classnames";

import { ui } from "lib";
// import { Header } from "../Header";
import { LeafLogo } from "components/icons";

import { Content } from "./Content";

export type MainProps = ui.ComponentProps<{ readonly children: JSX.Element }>;

/**
 * A component that represents the content to the right of the <Sidebar /> in the overall
 * application layout.
 */
export const Main = (props: MainProps): JSX.Element => (
  <main {...props} className={classNames("main", props.className)}>
    {/* <Header /> */}
    <LeafLogo contain={ui.SizeContains.SQUARE} />
    <Content>{props.children}</Content>
  </main>
);
