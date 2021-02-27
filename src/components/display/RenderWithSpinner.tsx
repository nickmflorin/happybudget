import React, { ReactNode } from "react";
import Spinner from "./Spinner";

interface RenderWithSpinnerProps {
  loading?: boolean;
  children: ReactNode;
  [key: string]: any;
}

const RenderWithSpinner = ({ hide, loading, children, ...props }: RenderWithSpinnerProps): JSX.Element => {
  return (
    <React.Fragment>
      {loading === true && <Spinner position={"absolute"} {...props} />}
      {children}
    </React.Fragment>
  );
};

export default RenderWithSpinner;
