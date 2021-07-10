import React from "react";

import { HttpError } from "components/feedback";
import { HttpErrorProps } from "components/feedback/HttpError";

const Error: React.FC<Omit<HttpErrorProps, "className">> = props => {
  return <HttpError className={"form-error"} {...props} />;
};

export default Error;
