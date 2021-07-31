import React from "react";
import SpinnerWrapper from "./SpinnerWrapper";
import Spinner, { SpinnerProps } from "./Spinner";

export interface WrappedSpinnerProps extends SpinnerProps {
  readonly spinnerStyle?: React.CSSProperties;
  readonly spinnerClassName?: string;
}

const WrappedSpinner: React.FC<WrappedSpinnerProps> = ({
  className,
  style = {},
  spinnerClassName,
  spinnerStyle = {},
  ...props
}) => {
  return (
    <SpinnerWrapper className={className} style={style}>
      <Spinner className={spinnerClassName} style={spinnerStyle} {...props} />
    </SpinnerWrapper>
  );
};

export default WrappedSpinner;
