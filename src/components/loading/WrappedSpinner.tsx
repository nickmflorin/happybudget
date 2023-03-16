import React from "react";

import Spinner, { SpinnerProps } from "./Spinner";
import SpinnerWrapper from "./SpinnerWrapper";

export interface WrappedSpinnerProps extends StandardComponentProps {
  readonly spinnerProps?: SpinnerProps;
}

const WrappedSpinner: React.FC<WrappedSpinnerProps> = ({ spinnerProps, ...props }) => (
  <SpinnerWrapper {...props}>
    <Spinner {...spinnerProps} />
  </SpinnerWrapper>
);

export default React.memo(WrappedSpinner);
