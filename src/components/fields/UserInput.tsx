import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/pro-regular-svg-icons";

import classNames from "classnames";

import Input, { InputProps } from "./Input";

export type UserInputProps = InputProps;

const UserInput = (props: UserInputProps): JSX.Element => (
  <Input
    prefix={<FontAwesomeIcon icon={faUser} className={"icon"} />}
    {...props}
    className={classNames("input", "input--user", props.className)}
  />
);

export default UserInput;
