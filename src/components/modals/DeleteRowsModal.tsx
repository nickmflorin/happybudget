import { Notification } from "components/feedback";
import { DeleteModal, DeleteModalProps } from "./generic";

interface DeleteRowsModalProps extends DeleteModalProps {
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
