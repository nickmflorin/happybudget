import { useMemo } from "react";
import { isNil } from "lodash";

import { AlertProps } from "./Alert";
import Error from "./Error";
import Warning from "./Warning";
import Success from "./Success";
import Info from "./Info";

export type NotifyProps = Omit<AlertProps, "type" | "alert"> & {
  readonly type?: AlertType;
  readonly alert?: IAlert;
};

const Notify: React.FC<NotifyProps> = ({ children, ...props }) => {
  const type = useMemo(() => {
    return !isNil(props.type) ? props.type : props.alert?.type || "error";
  }, [props.alert, props.type]);
  if (type === "warning") {
    return <Warning {...props}>{children}</Warning>;
  } else if (type === "error") {
    return <Error {...props}>{children}</Error>;
  } else if (type === "success") {
    return <Success {...props}>{children}</Success>;
  } else {
    return <Info {...props}>{children}</Info>;
  }
};

export default Notify;
