import React from "react";
import { Input as AntDInput } from "antd";
import { TextAreaProps as AntDTextAreaProps } from "antd/lib/input";
import classNames from "classnames";

export type TextAreaProps = AntDTextAreaProps;

const TextArea = (props: TextAreaProps): JSX.Element => (
  <AntDInput.TextArea {...props} className={classNames("text-area", props.className)} />
);

export default React.memo(TextArea);
