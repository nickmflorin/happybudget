import React, { ReactNode } from "react";
import Spinner, { SpinnerProps } from "./Spinner";

interface RenderOrSpinnerProps extends SpinnerProps {
  loading?: boolean;
  children: ReactNode;
}

const RenderOrSpinner = ({ loading, className, style = {}, children, ...props }: RenderOrSpinnerProps): JSX.Element => {
  if (!(loading === true)) {
    return (
      <React.Fragment>
        <div className={className} style={{ position: "relative", height: "100%", width: "100%", ...style }}>
          <Spinner {...props} />
          {children}
        </div>
      </React.Fragment>
    );
  }
  return <></>;
};

export default RenderOrSpinner;
