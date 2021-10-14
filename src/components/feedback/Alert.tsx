import { useEffect, useMemo, useState } from "react";
import { Alert as RootAlert } from "antd";
import { isNil } from "lodash";
import classNames from "classnames";
import { isHttpError, standardizeError } from "api";
import { toTitleCase } from "lib/util/formatters";

export interface AlertProps extends StandardComponentProps {
  readonly children?: string | JSX.Element | Http.Error | undefined;
  readonly title?: string;
  readonly visible?: boolean;
  readonly type: AlertType;
}

const Alert: React.FC<AlertProps> = ({ children, visible, type, className, title, style }) => {
  const [_visible, setVisible] = useState(false);

  const _children = useMemo(() => {
    if (!isNil(children) && isHttpError(children)) {
      return standardizeError(children).message;
    }
    return children;
  }, [children]);

  const _title = useMemo(() => {
    if (!isNil(title)) {
      return title;
    } else if (isHttpError(children)) {
      return "There was an error with the request.";
    }
    return !isNil(type) ? toTitleCase(type) : "";
  }, [title, children]);

  useEffect(() => {
    if (!isNil(visible)) {
      setVisible(visible);
    } else if (!isNil(_children)) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [visible, _children]);

  if (_visible === true) {
    return (
      <RootAlert
        className={classNames("alert", className)}
        message={_title}
        type={type}
        showIcon={true}
        style={style}
        description={_children}
      />
    );
  }
  return <></>;
};

export default Alert;
