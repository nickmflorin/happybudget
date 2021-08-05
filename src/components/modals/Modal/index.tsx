import { ReactNode } from "react";
import { Modal as RootModal } from "antd";
import { ModalProps as RootModalProps } from "antd/lib/modal";
import { RenderWithSpinner } from "components";

import ModalTitle from "./ModalTitle";

export interface ModalProps extends RootModalProps {
  loading?: boolean;
  children: ReactNode;
}

const Modal = ({
  loading,
  children,
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
    >
      <RenderWithSpinner loading={loading}>{children}</RenderWithSpinner>
    </RootModal>
  );
};

const exportable = {
  Modal: Modal,
  Title: ModalTitle
};

export default exportable;
