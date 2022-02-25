import React, { ReactNode } from "react";
import WrappedSpinner, { WrappedSpinnerProps } from "./WrappedSpinner";

interface RenderOrSpinnerProps extends WrappedSpinnerProps {
  readonly loading?: boolean;
  readonly children: ReactNode | JSX.Element | JSX.Element;
}

const RenderOrSpinner = ({ children, loading, ...props }: RenderOrSpinnerProps): JSX.Element => {
  if (loading === true) {
    return <WrappedSpinner {...props} />;
  }
  return <React.Fragment>{children}</React.Fragment>;
};

export default React.memo(RenderOrSpinner);
