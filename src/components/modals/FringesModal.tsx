import { Modal } from "components";
import "./FringesModal.scss";

export interface GenericFringesModalProps {
  readonly onCancel: () => void;
  readonly open: boolean;
  readonly children: JSX.Element;
}

const GenericFringesModal = ({ open, onCancel, ...props }: GenericFringesModalProps): JSX.Element => {
  return (
    <Modal.Modal className={"fringes-modal"} title={"Fringes"} visible={open} onCancel={() => onCancel()} footer={null}>
      {props.children}
    </Modal.Modal>
  );
};

export default GenericFringesModal;
