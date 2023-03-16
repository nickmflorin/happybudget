import React, { ReactNode, useMemo } from "react";

import { ShowHide } from "components";

import WrappedSpinner, { WrappedSpinnerProps } from "./WrappedSpinner";

interface RenderWithSpinnerProps extends WrappedSpinnerProps {
  readonly loading?: boolean;
  readonly toggleOpacity?: boolean;
  readonly children: ReactNode | JSX.Element | JSX.Element[];
}

const RenderWithSpinner = ({
  loading,
  children,
  toggleOpacity = false,
  ...props
}: RenderWithSpinnerProps): JSX.Element => {
  const newChildren = useMemo(() => {
    if (toggleOpacity === true) {
      return <div style={{ opacity: loading ? 0.3 : 1 }}>{children}</div>;
    }
    return children;
  }, [children, toggleOpacity]);

  return (
    <React.Fragment>
      <ShowHide show={loading === true}>
        <WrappedSpinner {...props} />
      </ShowHide>
      {newChildren}
    </React.Fragment>
  );
};

export default React.memo(RenderWithSpinner);
