import React from "react";

import classNames from "classnames";

import { Loading, LoadingProps } from "./Loading";

const _ScreenLoading = (props: LoadingProps): JSX.Element => (
  <Loading loading={true} className={classNames("loading--screen", props.className)} />
);

/**
 * A component that takes up the entire screen/viewport and centers a loading indicator in its
 * center.  This component should be used to show loading state when there is nothing rendered
 * in the content area yet.
 */
export const ScreenLoading = React.memo(_ScreenLoading);
