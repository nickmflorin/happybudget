import { Notification } from "components/notifications";
import { DeleteModal } from "./generic";

interface DeleteRowsModalProps extends ModalProps {
  readonly rows: Model.Model[];
}

function DeleteRowsModal({ rows, ...props }: DeleteRowsModalProps): JSX.Element {
  return (
    <DeleteModal {...props} title={"Delete Rows"}>
      <Notification level={"warning"} message={`You are about to delete ${rows.length} rows.`}>
        {"This action is not recoverable, the data will be permanently erased"}
      </Notification>
    </DeleteModal>
  );
}

export default DeleteRowsModal;
