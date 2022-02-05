import React from "react";
import classNames from "classnames";

import { Colors } from "style/constants";
import { ColorIcon } from "components/icons";
import BareButton, { BareButtonProps } from "./BareButton";

type ShareButtonProps = Omit<BareButtonProps, "children" | "icon"> & {
  readonly sharing: boolean;
};

const ShareButton = ({ sharing, ...props }: ShareButtonProps): JSX.Element => {
  return (
    <BareButton
      {...props}
      className={classNames("btn--share", props.className)}
      icon={<ColorIcon size={14} color={sharing ? Colors.GREEN : Colors.COLOR_NO_COLOR} />}
    >
      {sharing ? "Sharing" : "Not Sharing"}
    </BareButton>
  );
};

export default React.memo(ShareButton);
