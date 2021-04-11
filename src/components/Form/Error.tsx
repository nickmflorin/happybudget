import { useEffect, useMemo, useState } from "react";
import { Alert } from "antd";
import { isNil } from "lodash";
import classNames from "classnames";

import { isHttpError, standardizeError } from "api";

interface ErrorProps extends StandardComponentProps {
  children?: string | JSX.Element | Http.Error | undefined;
  detail?: string | undefined;
  title?: string;
  visible?: boolean;
}

const Error = ({ children, visible, className, title, detail, style }: ErrorProps): JSX.Element => {
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
    } else if (isHttpError(children)) {
      return standardizeError(children).message;
    } else if (typeof children === "string") {
      return children;
    }
    return undefined;
  }, [detail, children]);

  const message = useMemo(() => {
    if (!isNil(title)) {
      return title;
    } else if (isHttpError(children)) {
      return "There was an error with the request.";
    }
    return "There was an error.";
  }, [title, children]);

  if (_visible === true) {
    return (
      <Alert
        className={classNames("form-error", className)}
        message={message}
        description={description}
        type={"error"}
        showIcon={true}
        style={style}
      >
        {children}
      </Alert>
    );
  }
  return <></>;
};

export default Error;
