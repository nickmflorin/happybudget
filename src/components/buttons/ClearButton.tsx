import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import IconButton, { IconButtonProps } from "./IconButton";

const ClearButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => {
  return (
    <IconButton
      {...props}
      className={"btn btn--clear"}
      size={"small"}
      icon={<FontAwesomeIcon icon={faTimesCircle} />}
    />
  );
};

export default ClearButton;
