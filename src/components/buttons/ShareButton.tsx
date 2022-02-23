import React from "react";
import classNames from "classnames";

import { Colors } from "style/constants";
import { ColorIcon } from "components/icons";
import { ButtonProps } from "./Button";
import BareButton from "./BareButton";

type ShareButtonProps = Omit<ButtonProps, "children" | "icon"> & {
  readonly sharing: boolean;
};

const ShareButton = ({ sharing, ...props }: ShareButtonProps): JSX.Element => (
  <BareButton
    {...props}
    className={classNames("btn--share", props.className)}
    icon={<ColorIcon size={12} color={sharing ? Colors.GREEN : Colors.COLOR_NO_COLOR} />}
  >
    {sharing ? "Sharing" : "Not Sharing"}
  </BareButton>
);

export default React.memo(ShareButton);
