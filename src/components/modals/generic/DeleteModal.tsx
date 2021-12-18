import { Modal } from "components";

function DeleteModal({ children, ...props }: ModalProps & { readonly children: JSX.Element }): JSX.Element {
  return (
    <Modal {...props} okText={"Delete"} cancelText={"Cancel"} okButtonClass={"btn--danger"}>
      {children}
    </Modal>
  );
}

export default DeleteModal;
