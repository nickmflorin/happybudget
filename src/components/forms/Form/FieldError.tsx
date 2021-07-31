import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

interface FieldErrorProps extends StandardComponentProps {
  readonly children?: string | null;
}

const FieldError: React.FC<FieldErrorProps> = props => {
  if (!isNil(props.children)) {
    return (
      <div
        className={classNames("ant-form-item-explain ant-form-item-explain-error", props.className)}
        style={props.style}
      >
        <div role={"alert"}>{props.children}</div>
      </div>
    );
  }
  return <></>;
};

export default FieldError;
