import React, { useMemo, useState } from "react";
import { isNil, uniqueId } from "lodash";
import classNames from "classnames";

import { notifications } from "lib";
import { Icon } from "components";
import { ButtonLink, IconButton } from "components/buttons";

export type NotificationProps = Omit<StandardComponentProps, "id"> & {
  readonly includeIcon?: boolean;
};

export type NotificationObjectProps = UINotification & Omit<NotificationProps, "id">;
export type NoticationComponentProps = UINotificationData &
  NotificationProps & { readonly children?: string; readonly remove?: () => void; readonly id?: string | number };

type _NotificationProps = NotificationObjectProps | NoticationComponentProps;

const isNotificationComponentProps = (p: _NotificationProps): p is NoticationComponentProps =>
  (p as NoticationComponentProps).children !== undefined;

const Notification = ({ style, className, ...props }: _NotificationProps): JSX.Element => {
  const id = useMemo(() => (props.id !== undefined ? String(props.id) : uniqueId()), [props.id]);
  const [linkLoading, setLinkLoading] = useState(false);

  const IconLevelMap: { [key in AppNotificationLevel]: IconOrElement } = useMemo(
    () => ({
      success: <Icon icon={"check-circle"} weight={"solid"} />,
      info: <Icon icon={"info-circle"} weight={"solid"} />,
      error: <Icon icon={"exclamation-circle"} weight={"solid"} />,
      warning: <Icon icon={"exclamation-triangle"} weight={"solid"} />
    }),
    []
  );

  const detail = useMemo(
    () => (isNotificationComponentProps(props) ? props.children || props.detail : props.detail),
    [props]
  );

  const detailWithLink = useMemo(() => {
    if (!isNil(props.includeLink)) {
      const linkObj: AppNotificationLink = props.includeLink({ setLoading: setLinkLoading });
      return (
        <span>
          {detail !== undefined && notifications.notificationDetailToString(detail)}
          <ButtonLink loading={linkLoading} style={{ marginLeft: 6 }} onClick={() => linkObj.onClick?.()}>
            {linkObj.text}
          </ButtonLink>
        </span>
      );
    } else {
      return detail !== undefined ? notifications.notificationDetailToString(detail) : undefined;
    }
  }, [detail, props.includeLink, linkLoading]);

  const level = useMemo(() => props.level || "warning", [props.level]);
  const icon = useMemo(() => IconLevelMap[level], [level]);

  return (
    <div
      style={style}
      id={id === undefined ? undefined : String(id)}
      className={classNames("notification", level, className)}
    >
      {props.includeIcon !== false && <div className={"notification-left"}>{icon}</div>}
      <div className={"notification-middle"}>
        {!isNil(props.message) && <div className={"notification-message"}>{props.message}</div>}
        {!isNil(detailWithLink) && <div className={"notification-detail"}>{detailWithLink}</div>}
      </div>
      {props.closable !== false && !isNil(props.remove) && (
        <div className={"notification-right"}>
          <IconButton fill icon={"times"} onClick={() => props.remove?.()} />
        </div>
      )}
    </div>
  );
};

export default React.memo(Notification);
