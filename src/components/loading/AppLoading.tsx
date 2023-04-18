import React from "react";

import classNames from "classnames";

import { Portal } from "components/layoutOld";

import { Loading, LoadingProps } from "./Loading";

export type AppLoadingProps = Omit<LoadingProps, "loading" | "children"> & {
  readonly visible?: boolean;
};

const _AppLoading = ({ visible, ...props }: AppLoadingProps): JSX.Element => (
  <Portal id="application-spinner-container" visible={true}>
    <Loading
      {...props}
      style={{ opacity: visible === true ? 1 : 0 }}
      className={classNames("loading--app", props.className)}
    />
  </Portal>
);

export const AppLoading = React.memo(_AppLoading);
