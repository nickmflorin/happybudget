import { ReactNode } from "react";
import Spinner, { SpinnerProps } from "./Spinner";

import SpinnerWrapper from "./SpinnerWrapper";

interface RenderOrSpinnerProps extends SpinnerProps {
  loading?: boolean;
  children: ReactNode;
}

const RenderOrSpinner = ({ loading, className, style = {}, children, ...props }: RenderOrSpinnerProps): JSX.Element => {
  if (loading === true) {
    return (
      <SpinnerWrapper className={className} style={style}>
        <Spinner {...props} />
      </SpinnerWrapper>
    );
  }
  return <>{children}</>;
};

export default RenderOrSpinner;
