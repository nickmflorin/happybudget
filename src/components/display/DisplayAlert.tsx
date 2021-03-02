import React from "react";
import { Alert } from "antd";
import { isNil } from "lodash";
import classNames from "classnames";

import { ClientError, NetworkError } from "api";
import { toTitleCase } from "util/string";

import "./DisplayAlert.scss";

const getMessage = (options: {
  error?: Error | string;
  warning?: Error | string;
  message?: string;
  type: "error" | "success" | "info" | "warning";
}): string | undefined => {
  if (!isNil(options.message)) {
    return options.message;
  } else if (!isNil(options.error) || !isNil(options.warning)) {
    const errorOrWarning = !isNil(options.error) ? options.error : options.warning;
    if (errorOrWarning instanceof ClientError) {
      return "There was an error with the request.";
    } else if (errorOrWarning instanceof NetworkError) {
      return "There was a problem communicating with the server.";
    } else {
      if (errorOrWarning instanceof Error) {
        return "There was an error.";
      }
      return errorOrWarning;
    }
  } else {
    if (options.type === "error") {
      return "There was an error.";
    }
    return toTitleCase(options.type);
  }
};

const getDescription = (options: {
  error?: Error | string;
  warning?: Error | string;
  description?: string;
  children?: Error | string | JSX.Element;
}): string | undefined => {
  if (!isNil(options.description)) {
    return options.description;
  } else if (!isNil(options.children)) {
    if (options.children instanceof Error) {
      return options.children.message;
    } else if (typeof options.children === "string") {
      return options.children;
    }
    return undefined;
  } else if (!isNil(options.error) || !isNil(options.warning)) {
    const errorOrWarning = !isNil(options.error) ? options.error : options.warning;
    if (errorOrWarning instanceof Error) {
      return errorOrWarning.message;
    }
    return errorOrWarning;
  } else {
    return undefined;
  }
};

interface DisplayAlertProps {
  className?: string;
  children?: Error | string | JSX.Element;
  showIcon?: boolean;
  error?: Error | string;
  warning?: Error | string;
  description?: string;
  message?: string;
  type?: "error" | "success" | "info" | "warning" | undefined;
  style?: any;
  visible?: boolean;
}

const DisplayAlert = ({
  children,
  className,
  description,
  message,
  style,
  error,
  warning,
  type = "error",
  showIcon = true,
  visible
}: DisplayAlertProps): JSX.Element => {
  const component = (
    <Alert
      className={classNames("display-alert", className)}
      message={getMessage({ error, warning, type, message })}
      description={getDescription({ error, warning, description, children })}
      type={type}
      showIcon={showIcon}
      style={style}
    >
      {children}
    </Alert>
  );
  // If visibility is being explicitly controlled, show the alert dependent only
  // on it's explicitly provided value.
  if (!isNil(visible)) {
    if (visible === true) {
      return component;
    }
    return <></>;
  } else {
    // If visibility isn't being explicitly controlled, only show the alert in
    // the error or warning case if the children, error or warning are provided
    // and defined.
    if (type === "info" || type === "success" || type === "warning") {
      return component;
    } else if (!isNil(children) || !isNil(error)) {
      return component;
    }
    return <></>;
  }
};

export default DisplayAlert;
