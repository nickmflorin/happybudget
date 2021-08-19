import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import IconButton, { IconButtonProps } from "./IconButton";

const ImageClearButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => {
  return (
    <IconButton
      {...props}
      className={"btn btn--clear-image"}
      size={"medium"}
      icon={<FontAwesomeIcon className={"icon"} icon={faTimesCircle} />}
    />
  );
};

export default ImageClearButton;
