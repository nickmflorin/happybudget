import React, { ReactNode } from "react";
import Spinner from "./Spinner";

interface RenderOrSpinnerProps {
  hide?: boolean;
  loading?: boolean;
  children: ReactNode;
  [key: string]: any;
}

const RenderOrSpinner = ({ hide, loading, children, ...props }: RenderOrSpinnerProps): JSX.Element => {
  if (hide === true) {
    return <></>;
  } else if (loading === true) {
    return <Spinner {...props} />;
  } else {
    return <>{children}</>;
  }
};

export default RenderOrSpinner;
