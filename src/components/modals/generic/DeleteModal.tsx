import { Modal } from "components";

import { ModalProps as RootModalProps } from "antd/lib/modal";

export type DeleteModalProps = Omit<
  RootModalProps,
  "visible" | "okText" | "cancelText" | "getContainer" | "destroyOnClose"
> & {
  readonly open: boolean;
  readonly children?: JSX.Element;
};

function DeleteModal({ open, children, ...props }: DeleteModalProps): JSX.Element {
  return (
    <Modal
      {...props}
      visible={open}
      okText={"Delete"}
      cancelText={"Cancel"}
      getContainer={false}
      destroyOnClose={true}
      okButtonClass={"btn--danger"}
    >
      {children}
    </Modal>
  );
}

export default DeleteModal;
