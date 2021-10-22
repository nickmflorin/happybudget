import { ReactNode } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Modal as RootModal } from "antd";
import { ModalProps as RootModalProps } from "antd/lib/modal";
import { RenderWithSpinner } from "components";

import ModalTitle from "./ModalTitle";

export interface ModalProps extends RootModalProps {
  readonly loading?: boolean;
  readonly children: ReactNode;
  readonly titleIcon?: IconOrElement;
  readonly okButtonClass?: string;
}

const Modal = ({
  loading,
  children,
  titleIcon,
  okButtonClass = "btn--primary",
  okButtonProps = {},
  cancelButtonProps = {},
  ...props
}: ModalProps): JSX.Element => {
  return (
    <RootModal
      cancelText={"Cancel"}
      okButtonProps={{
        ...okButtonProps,
        className: classNames("btn", okButtonClass)
      }}
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
