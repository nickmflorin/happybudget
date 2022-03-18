import { Confirmation } from "components/notifications";

import { DeleteModal } from "./generic";

interface DeleteRowsModalProps extends ModalProps {
  readonly rows: Model.Model[];
}

const DeleteRowsModal = ({ rows, ...props }: DeleteRowsModalProps): JSX.Element => (
  <DeleteModal {...props} className={"delete-rows-modal"} title={"Delete Rows"}>
    <Confirmation
      message={`You are about to delete ${rows.length} rows.`}
      suppressionKey={"delete-modal-confirmation-visibility"}
    >
      {"This action is not recoverable, the data will be permanently erased"}
    </Confirmation>
  </DeleteModal>
);

export default DeleteRowsModal;
