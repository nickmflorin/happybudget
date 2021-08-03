import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import IconButton, { IconButtonProps } from "./IconButton";

const ImageClearButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => {
  return (
    <IconButton
      {...props}
      className={"btn--clear-image"}
      size={"medium"}
      icon={<FontAwesomeIcon icon={faTimesCircle} />}
    />
  );
};

export default ImageClearButton;
