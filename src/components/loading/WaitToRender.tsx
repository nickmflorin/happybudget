import { ReactNode } from "react";

interface WaitToRenderProps {
  waiting?: boolean;
  children: ReactNode;
}

const WaitToRender = ({ waiting, children }: WaitToRenderProps): JSX.Element => {
  if (waiting === true) {
    return <></>;
  }
  return <>{children}</>;
};

export default WaitToRender;
