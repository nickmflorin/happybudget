import React, { useState, useEffect, useImperativeHandle } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ui, notifications } from "lib";
import { BannerNotifications } from "components/notifications";

import Content from "./Content";
import Header from "./Header";

export interface GenericLayoutProps extends StandardComponentWithChildrenProps {
  readonly headerProps?: StandardComponentProps;
  readonly showHeaderLogo?: boolean | undefined;
  readonly contentProps?: StandardComponentProps;
  readonly sidebar?: JSX.Element;
  readonly layout?: NonNullRef<ILayoutRef>;
  readonly showHeaderSidebarToggle?: boolean | undefined;
}

const GenericLayout = (props: GenericLayoutProps): JSX.Element => {
  const isMobile = ui.hooks.useLessThanBreakpoint("medium");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const NotificationsHandler = notifications.ui.useNotificationsEventListener({
    destinationId: "banner",
    defaultBehavior: "append",
    defaultClosable: true
  });

  useEffect(() => {
    /* We want to hide the sidebar by default on mobile devices but show it by
       default on larger devices. */
    setSidebarVisible(!isMobile);
  }, [isMobile]);

  useImperativeHandle(
    props.layout,
    () => ({
      setSidebarVisible,
      sidebarVisible,
      toggleSidebar: () => setSidebarVisible(!sidebarVisible)
    }),
    [sidebarVisible, setSidebarVisible]
  );

  return (
    <div className={classNames("layout", props.className, { "sidebar-visible": sidebarVisible })} style={props.style}>
      {!isNil(props.sidebar) && <div className={classNames("sidebar-container")}>{props.sidebar}</div>}
      <div className={"layout-content"}>
        <BannerNotifications notifications={NotificationsHandler.notifications} />
        <Header
          {...props.headerProps}
          showHeaderLogo={props.showHeaderLogo}
          showHeaderSidebarToggle={
            props.showHeaderSidebarToggle === undefined ? !sidebarVisible : props.showHeaderSidebarToggle
          }
          className={classNames(props.headerProps?.className)}
          sidebarVisible={sidebarVisible}
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        />
        <Content {...props.contentProps}>{props.children}</Content>
      </div>
    </div>
  );
};

export default React.memo(GenericLayout);
