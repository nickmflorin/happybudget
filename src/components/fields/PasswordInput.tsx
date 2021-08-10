import { Input as AntDInput } from "antd";
import { InputProps as AntDInputProps } from "antd/lib/input";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/pro-regular-svg-icons";

import classNames from "classnames";

export type PasswordInputProps = AntDInputProps;

const PasswordInput = (props: PasswordInputProps): JSX.Element => (
  <AntDInput.Password
    placeholder={"Passsword"}
    prefix={<FontAwesomeIcon icon={faLock} className={"icon"} />}
    {...props}
    className={classNames("input", "input--password", props.className)}
  />
);

export default PasswordInput;
