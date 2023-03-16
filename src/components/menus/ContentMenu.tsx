import React, { useImperativeHandle, useState } from "react";

import classNames from "classnames";

import { notifications } from "lib";
import { RenderWithSpinner } from "components";
import { Notifications } from "components/notifications";

export type ContentMenuProps = StandardComponentWithChildrenProps & {
  readonly menu?: NonNullRef<ContentMenuInstance>;
};

const ContentMenu = ({ menu, children, ...props }: ContentMenuProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const notificationsManager = notifications.ui.useNotificationsManager({
    defaultBehavior: "append",
    defaultClosable: false,
  });

  useImperativeHandle(menu, () => ({
    ...notificationsManager,
    loading,
    setLoading,
  }));

  return (
    <div {...props} className={classNames("menu menu--content", props.className)}>
      <RenderWithSpinner loading={loading}>
        <Notifications notifications={notificationsManager.notifications} />
        {children}
      </RenderWithSpinner>
    </div>
  );
};

export default React.memo(ContentMenu) as typeof ContentMenu;
