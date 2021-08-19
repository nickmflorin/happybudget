import { Icon } from "components";
import IconButton, { IconButtonProps } from "./IconButton";

const ImageClearButton = (props: Omit<IconButtonProps, "size" | "icon">): JSX.Element => {
  return (
    <IconButton
      {...props}
      className={"btn--clear-image"}
      size={"medium"}
      icon={<Icon icon={"times-circle"} weight={"solid"} />}
    />
  );
};

export default ImageClearButton;
