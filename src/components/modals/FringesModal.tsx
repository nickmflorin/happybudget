import { Modal } from "components";
import "./FringesModal.scss";

const GenericFringesModal = (props: ModalProps & { readonly children: JSX.Element }): JSX.Element => {
  return (
    <Modal className={"fringes-modal"} title={"Fringes"} {...props} footer={null}>
      {props.children}
    </Modal>
  );
};

export default GenericFringesModal;
