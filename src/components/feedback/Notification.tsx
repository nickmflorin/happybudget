import { useMemo } from "react";
import { isNil } from "lodash";

import { ButtonLink } from "components/buttons";

import { AlertProps } from "./Alert";
import Error from "./Error";
import Warning from "./Warning";
import Success from "./Success";
import Info from "./Info";

export type NotificationProps = Omit<AlertProps, "type" | "alert"> & {
  readonly type?: AlertType;
  readonly alert?: IAlert;
  readonly includeLink?: { readonly text?: string; readonly onClick?: () => void; readonly loading?: boolean };
};

const Notification: React.FC<NotificationProps> = ({ children, includeLink, ...props }) => {
  const type = useMemo(() => {
    return !isNil(props.type) ? props.type : props.alert?.type || "error";
  }, [props.alert, props.type]);

  const _children = useMemo(() => {
    if (!isNil(includeLink)) {
      return (
        <span>
          {children}
          <ButtonLink loading={includeLink?.loading} style={{ marginLeft: 6 }} onClick={() => includeLink?.onClick?.()}>
            {includeLink?.text}
          </ButtonLink>
        </span>
      );
    } else {
      return children;
    }
  }, [children, includeLink]);

  if (type === "warning") {
    return <Warning {...props}>{_children}</Warning>;
  } else if (type === "error") {
    return <Error {...props}>{_children}</Error>;
  } else if (type === "success") {
    return <Success {...props}>{_children}</Success>;
  } else {
    return <Info {...props}>{_children}</Info>;
  }
};

export default Notification;
