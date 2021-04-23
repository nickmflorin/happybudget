import { ReactNode } from "react";
import classNames from "classnames";
import "./SpinnerWrapper.scss";

interface SpinnerWrapperProps extends StandardComponentProps {
  children: ReactNode;
}

const SpinnerWrapper: React.FC<SpinnerWrapperProps> = ({ children, className, style = {} }) => {
  return (
    <div className={classNames("spinner-wrapper", className)} style={style}>
      {children}
    </div>
  );
};

export default SpinnerWrapper;
