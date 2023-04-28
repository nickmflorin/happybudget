import { ReactNode } from "react";

import classNames from "classnames";

import * as ui from "lib/ui/types";

import { Content } from "./Content";
import { Header } from "./Header";

export type MainProps = ui.ComponentProps<{
  readonly children: ReactNode;
  readonly header?: JSX.Element | JSX.Element[];
}>;

export const Main = (props: MainProps): JSX.Element => (
  <main {...props} className={classNames("main", props.className)}>
    {props.header !== undefined && <Header>{props.header}</Header>}
    <Content>{props.children}</Content>
  </main>
);
