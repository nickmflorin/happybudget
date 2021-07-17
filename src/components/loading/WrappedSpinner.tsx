import { ReactNode } from "react";
import SpinnerWrapper from "./SpinnerWrapper";
import Spinner, { SpinnerProps } from "./Spinner";

export interface WrappedSpinnerProps extends SpinnerProps {
  readonly spinnerStyle?: React.CSSProperties;
  readonly spinnerClassName?: string;
  readonly children?: ReactNode;
}

const WrappedSpinner: React.FC<WrappedSpinnerProps> = ({
  className,
  style = {},
  spinnerClassName,
  spinnerStyle = {},
  children,
  ...props
}) => {
  return (
    <SpinnerWrapper className={className} style={style}>
      <Spinner className={spinnerClassName} style={spinnerStyle} {...props} />
      {children}
    </SpinnerWrapper>
  );
};

export default WrappedSpinner;
