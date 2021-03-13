import React, { ReactNode } from "react";
import { ShowHide } from "components/display";
import Spinner, { SpinnerProps } from "./Spinner";

interface RenderWithSpinnerProps {
  loading?: boolean;
  toggleOpacity?: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  spinnerProps?: SpinnerProps;
}

const RenderWithSpinner = ({
  loading,
  className,
  style = {},
  toggleOpacity = false,
  children,
  spinnerProps
}: RenderWithSpinnerProps): JSX.Element => {
  return (
    <React.Fragment>
      <ShowHide show={toggleOpacity === true}>
        <div className={className} style={{ ...style, position: "relative" }}>
          {loading === true && <Spinner position={"absolute"} {...spinnerProps} />}
          <div style={{ opacity: loading ? 0.3 : 1 }}>{children}</div>
        </div>
      </ShowHide>
      <ShowHide show={toggleOpacity === false}>
        <div className={className} style={{ ...style, position: "relative" }}>
          {loading === true && <Spinner position={"absolute"} {...spinnerProps} />}
          {children}
        </div>
      </ShowHide>
    </React.Fragment>
  );
};

export default RenderWithSpinner;
