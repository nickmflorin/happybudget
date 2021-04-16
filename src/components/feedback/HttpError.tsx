import { useMemo } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { isHttpError, standardizeError } from "api";
import Error, { ErrorProps } from "./Error";

export interface HttpErrorProps extends ErrorProps {
  children?: string | JSX.Element | Http.Error | undefined;
}

const HttpError: React.FC<HttpErrorProps> = ({ children, className, title, detail, ...props }) => {
  const _detail = useMemo(() => {
    if (!isNil(detail)) {
      return detail;
    } else if (isHttpError(children)) {
      return standardizeError(children).message;
    } else if (typeof children === "string") {
      return children;
    }
    return undefined;
  }, [detail, children]);

  const _title = useMemo(() => {
    if (!isNil(title)) {
      return title;
    } else if (isHttpError(children)) {
      return "There was an error with the request.";
    }
    return "There was an error.";
  }, [title, children]);

  return (
    <Error className={classNames("http-error", className)} title={_title} detail={_detail} {...props}>
      {children}
    </Error>
  );
};

export default HttpError;
