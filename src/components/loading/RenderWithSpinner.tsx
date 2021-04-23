import React, { ReactNode } from "react";
import { ShowHide } from "components";
import Spinner, { SpinnerProps } from "./Spinner";
import SpinnerWrapper from "./SpinnerWrapper";

interface RenderWithSpinnerProps extends SpinnerProps {
  loading?: boolean;
  toggleOpacity?: boolean;
  children: ReactNode;
  className?: string;
}

const RenderWithSpinner = ({
  loading,
  className,
  toggleOpacity = false,
  children,
  ...props
}: RenderWithSpinnerProps): JSX.Element => {
  return (
    <React.Fragment>
      <ShowHide show={toggleOpacity === true}>
        <React.Fragment>
          {loading === true && (
            <SpinnerWrapper>
              <Spinner {...props} />
            </SpinnerWrapper>
          )}
          <div style={{ opacity: loading ? 0.3 : 1 }}>{children}</div>
        </React.Fragment>
      </ShowHide>
      <ShowHide show={toggleOpacity === false}>
        <React.Fragment>
          {loading === true && (
            <SpinnerWrapper>
              <Spinner {...props} />
            </SpinnerWrapper>
          )}
          {children}
        </React.Fragment>
      </ShowHide>
    </React.Fragment>
  );
};

export default RenderWithSpinner;
