import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/pro-regular-svg-icons";

import classNames from "classnames";

import Input, { InputProps } from "./Input";

export type EmailInputProps = InputProps;

const EmailInput = (props: EmailInputProps): JSX.Element => (
  <Input
    placeholder={"Email"}
    prefix={<FontAwesomeIcon icon={faEnvelope} className={"icon"} />}
    {...props}
    className={classNames("input", "input--email", props.className)}
  />
);

export default EmailInput;
