import React, { ReactNode, useImperativeHandle, useState } from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";

import { Modal as RootModal } from "antd";

import { notifications } from "lib";
import { RenderWithSpinner } from "components";
import { Notification } from "components/feedback";

import ModalTitle from "./ModalTitle";

const Modal = ({
  children,
  titleIcon,
  okButtonClass = "btn--primary",
  okButtonProps = {},
  cancelButtonProps = {},
  modal,
  buttonSpinnerOnLoad = false,
  open,
  ...props
}: ModalProps & { readonly children: ReactNode }): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const notificationsHandler = notifications.ui.useNotifications();

  useImperativeHandle(modal, () => ({ ...notificationsHandler, loading, setLoading }));

  return (
    <RootModal
      cancelText={"Cancel"}
      destroyOnClose={true}
      getContainer={false}
      okButtonProps={{
        ...okButtonProps,
        className: classNames("btn", okButtonClass),
        loading: buttonSpinnerOnLoad === true && loading
      }}
      cancelButtonProps={{ ...cancelButtonProps, className: "btn btn--default" }}
      {...props}
      visible={open}
      title={
        typeof props.title === "string" && !isNil(titleIcon) ? (
          <ModalTitle icon={titleIcon} title={props.title} />
        ) : (
          props.title
        )
      }
    >
      <RenderWithSpinner loading={buttonSpinnerOnLoad === false && loading}>
        {notificationsHandler.notifications.length !== 0 && (
          <div className={"modal-alert-wrapper"}>
            {map(notificationsHandler.notifications, (n: UINotification, index: number) => {
              return <Notification key={index} {...n} />;
            })}
          </div>
        )}
        <React.Fragment>{children}</React.Fragment>
      </RenderWithSpinner>
    </RootModal>
  );
};

export default Modal;
