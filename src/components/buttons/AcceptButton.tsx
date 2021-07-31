import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import IconButton, { IconButtonProps } from "./IconButton";

const AcceptButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => {
  return (
    <IconButton {...props} className={"btn--accept"} size={"small"} icon={<FontAwesomeIcon icon={faCheckCircle} />} />
  );
};

export default AcceptButton;
