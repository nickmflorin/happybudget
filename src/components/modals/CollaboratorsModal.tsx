import classNames from "classnames";

import { Modal } from "./generic";

type CollaboratorsModalProps = ModalProps;

const CollaboratorsModal = (props: CollaboratorsModalProps): JSX.Element => (
  <Modal
    {...props}
    footer={null}
    title={"Collaborators"}
    className={classNames("collaborators-modal", props.className)}
  >
    <>{"Under construction"}</>
  </Modal>
);

export default CollaboratorsModal;
