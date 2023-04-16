import React from "react";

import classNames from "classnames";

import { ui, core } from "lib";
import { ShowHide } from "components/util";

import { Spinner, SpinnerProps } from "./Spinner";

export type LoadingProps = ui.ComponentProps<
  Pick<SpinnerProps, "loading" | "color"> & {
    /**
      Defines properties for the child `<Spinner />` that are not defined at the top level of the
      {@link LoadingProps} (i.e. `size` or `loading`).  The `size` and/or `loading` props are used
      far more often - and are brought up to the top level for simpler usage.  The other props that
      are used less often, can still be specified via this prop.
      */
    readonly spinnerProps?: Omit<SpinnerProps, "size" | "destroyAfter" | "color" | "loading">;
    readonly style?: Omit<ui.Style, "color">;
    readonly size?: Exclude<SpinnerProps["size"], typeof ui.SpinnerSizes.FILL>;
    readonly children?: core.ElementRestrictedNode;
    readonly hideWhenLoading?: boolean;
  }
>;

const _WrappedSpinner = ({
  size,
  spinnerProps,
  color,
  ...props
}: Omit<LoadingProps, "loading" | "children" | "hideWhenLoading">) => (
  <div {...props} className={classNames("loading", props.className)}>
    <Spinner {...spinnerProps} size={size} color={color} loading={true} />
  </div>
);

const WrappedSpinner = React.memo(_WrappedSpinner);

export const _Loading = ({
  loading,
  hideWhenLoading = false,
  children,
  ...props
}: LoadingProps): JSX.Element =>
  hideWhenLoading === true ? (
    loading === true ? (
      <WrappedSpinner {...props} />
    ) : (
      <>{children}</>
    )
  ) : (
    <>
      <ShowHide show={loading === true}>
        <WrappedSpinner {...props} />
      </ShowHide>
      {children}
    </>
  );

/* Memoize this so that it doesn't rerender when the parent rerenders unless it needs to.  It can
   sometimes cause weird glitching or skipping behavior in spinner. */
export const Loading = React.memo(_Loading);
