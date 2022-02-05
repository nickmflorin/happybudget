import React, { ReactNode, useImperativeHandle, useState } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Modal as RootModal } from "antd";

import { notifications } from "lib";
import { RenderWithSpinner } from "components";
import { Notifications } from "components/notifications";

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
  const notificationsManager = notifications.ui.useNotificationsManager({
    defaultBehavior: "append",
    defaultClosable: false
  });

  useImperativeHandle(modal, () => ({ ...notificationsManager, loading, setLoading }));

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
      className={classNames("modal", props.className, { "modal--no-footer": props.footer === null })}
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
        <Notifications notifications={notificationsManager.notifications} />
        <React.Fragment>{children}</React.Fragment>
      </RenderWithSpinner>
    </RootModal>
  );
};

export default Modal;
