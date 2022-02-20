import React from "react";
import SpinnerWrapper from "./SpinnerWrapper";
import Spinner, { SpinnerProps } from "./Spinner";

export interface WrappedSpinnerProps extends StandardComponentProps {
  readonly spinnerProps?: SpinnerProps;
}

const WrappedSpinner: React.FC<WrappedSpinnerProps> = ({ spinnerProps, ...props }) => (
  <SpinnerWrapper {...props}>
    <Spinner {...spinnerProps} />
  </SpinnerWrapper>
);

export default React.memo(WrappedSpinner);
