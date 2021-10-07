import { ReactNode } from "react";
import { Modal as RootModal } from "antd";
import { ModalProps as RootModalProps } from "antd/lib/modal";
import { RenderWithSpinner } from "components";
import { isNil } from "lodash";

import ModalTitle from "./ModalTitle";

export interface ModalProps extends RootModalProps {
  readonly loading?: boolean;
  readonly children: ReactNode;
  readonly titleIcon?: IconOrElement;
}

const Modal = ({
  loading,
  children,
  titleIcon,
  okButtonProps = {},
  cancelButtonProps = {},
  ...props
}: ModalProps): JSX.Element => {
  return (
    <RootModal
      cancelText={"Cancel"}
      okButtonProps={{ ...okButtonProps, className: "btn btn--primary" }}
      cancelButtonProps={{ ...cancelButtonProps, className: "btn btn--default" }}
      {...props}
      title={
        typeof props.title === "string" && !isNil(titleIcon) ? (
          <ModalTitle icon={titleIcon} title={props.title} />
        ) : (
          props.title
        )
      }
    >
      <RenderWithSpinner loading={loading}>{children}</RenderWithSpinner>
    </RootModal>
  );
};

export default Modal;
