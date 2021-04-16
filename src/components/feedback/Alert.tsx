import { useEffect, useMemo, useState } from "react";
import { Alert as RootAlert } from "antd";
import { isNil } from "lodash";
import classNames from "classnames";

export interface AlertProps extends StandardComponentProps {
  children?: string | JSX.Element | Http.Error | undefined;
  detail?: string | undefined;
  title?: string;
  visible?: boolean;
  type?: "error" | "info" | "warning";
}

const Alert: React.FC<AlertProps> = ({ children, visible, type, className, title, detail, style }) => {
  const [_visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isNil(visible)) {
      setVisible(visible);
    } else if (!isNil(children)) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [visible, children]);

  const description = useMemo(() => {
    if (!isNil(detail)) {
      return detail;
    } else if (typeof children === "string") {
      return children;
    }
    return undefined;
  }, [detail, children]);

  const message = useMemo(() => {
    if (!isNil(title)) {
      return title;
    }
    return "There was an error.";
  }, [title, children]);

  if (_visible === true) {
    return (
      <RootAlert
        className={classNames("alert", className)}
        message={message}
        description={description}
        type={type}
        showIcon={true}
        style={style}
      >
        {children}
      </RootAlert>
    );
  }
  return <></>;
};

export default Alert;
