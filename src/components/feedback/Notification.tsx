import { useMemo, useState } from "react";
import { isNil } from "lodash";

import { notifications } from "lib";
import { ButtonLink } from "components/buttons";

import Error from "./Error";
import Warning from "./Warning";
import Success from "./Success";
import Info from "./Info";

const Notification = ({
  includeLink,
  detail,
  children,
  ...props
}: ExternalNotification & { readonly children?: string }) => {
  const [linkLoading, setLinkLoading] = useState(false);

  const fullDetail = useMemo(() => {
    return !isNil(children) ? children : detail;
  }, [detail, children]);

  const detailWithLink = useMemo(() => {
    if (!isNil(includeLink)) {
      const linkObj: AppNotificationLink = includeLink({ setLoading: setLinkLoading });
      return (
        <span>
          {fullDetail !== undefined && notifications.notificationDetailToString(fullDetail)}
          <ButtonLink loading={linkLoading} style={{ marginLeft: 6 }} onClick={() => linkObj.onClick?.()}>
            {linkObj.text}
          </ButtonLink>
        </span>
      );
    } else {
      return fullDetail !== undefined ? notifications.notificationDetailToString(fullDetail) : undefined;
    }
  }, [fullDetail, includeLink, linkLoading]);

  if (props.level === "warning" || props.level === undefined) {
    return <Warning {...props} detail={detailWithLink} />;
  } else if (props.level === "error") {
    return <Error {...props} detail={detailWithLink} />;
  } else if (props.level === "success") {
    return <Success {...props} detail={detailWithLink} />;
  } else {
    return <Info {...props} detail={detailWithLink} />;
  }
};

export default Notification;
