import classNames from "classnames";

import { Confirmation, ConfirmationProps } from "components/notifications";

import { Modal } from "./generic";

type ConfirmationModalProps = ModalProps & Pick<ConfirmationProps, "suppressionKey" | "message" | "children">;

const ConfirmationModal = ({ suppressionKey, message, ...props }: ConfirmationModalProps): JSX.Element => (
  <Modal
    {...props}
    okText={props.okText || "Ok"}
    cancelText={props.cancelText || "Cancel"}
    className={classNames("confirmation-modal", props.className)}
  >
    <Confirmation message={message} suppressionKey={suppressionKey}>
      {props.children}
    </Confirmation>
  </Modal>
);

export default ConfirmationModal;
