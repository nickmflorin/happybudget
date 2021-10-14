import { AlertProps } from "./Alert";
import Error from "./Error";
import Warning from "./Warning";
import Info from "./Info";

export type NotifyProps = AlertProps;

const Notify: React.FC<NotifyProps> = ({ type, children, ...props }) => {
  if (type === "warning") {
    return <Warning {...props}>{children}</Warning>;
  } else if (type === "error") {
    return <Error {...props}>{children}</Error>;
  } else {
    return <Info {...props}>{children}</Info>;
  }
};

export default Notify;
