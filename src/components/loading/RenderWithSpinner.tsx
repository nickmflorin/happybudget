import { ReactNode, useMemo } from "react";
import WrappedSpinner, { WrappedSpinnerProps } from "./WrappedSpinner";

interface RenderWithSpinnerProps extends WrappedSpinnerProps {
  readonly loading?: boolean;
  readonly toggleOpacity?: boolean;
  readonly children: ReactNode | JSX.Element | JSX.Element[];
}

const RenderWithSpinner = ({ loading, toggleOpacity = false, ...props }: RenderWithSpinnerProps): JSX.Element => {
  const children = useMemo(() => {
    if (toggleOpacity === true) {
      return <div style={{ opacity: loading ? 0.3 : 1 }}>{props.children}</div>;
    }
    return props.children;
  }, [props.children, toggleOpacity]);

  if (loading === true) {
    return <WrappedSpinner {...props}>{children}</WrappedSpinner>;
  }
  return <>{children}</>;
};

export default RenderWithSpinner;
