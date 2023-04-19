import React from "react";

import classNames from "classnames";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { cookies } from "lib";
import { Notification } from "deprecated/components/notifications";

export type ConfirmationProps = StandardComponentProps & {
  readonly level?: AppNotificationLevel;
  readonly message: string;
  readonly children: string;
  readonly suppressionKey: string;
};

const Confirmation = ({
  level = "warning",
  message,
  children,
  suppressionKey,
  ...props
}: ConfirmationProps): JSX.Element => (
  <div {...props} className={classNames("confirmation", props.className)}>
    <Notification bare={true} level={level} message={message}>
      {children}
    </Notification>
    <Checkbox
      style={{ display: "flex", alignItems: "center", marginTop: "10px" }}
      onChange={(e: CheckboxChangeEvent) => {
        cookies.setConfirmationSuppressed(suppressionKey, e.target.checked);
      }}
    >
      Don't show this message again
    </Checkbox>
  </div>
);

export default React.memo(Confirmation);
