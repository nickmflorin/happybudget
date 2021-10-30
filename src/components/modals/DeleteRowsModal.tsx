import { Notification } from "components/feedback";
import { Modal } from "components";

interface DeleteRowsModalProps {
  readonly open: boolean;
  readonly onCancel: () => void;
  readonly onSuccess: (() => void) | undefined;
  readonly rows: Model.Model[];
}

function DeleteRowsModal({ open, onCancel, onSuccess, rows, ...props }: DeleteRowsModalProps): JSX.Element {
  return (
    <Modal
      {...props}
      visible={open}
      okText={"Delete"}
      cancelText={"Cancel"}
      getContainer={false}
      destroyOnClose={true}
      title={"Delete Rows"}
      okButtonClass={"btn--danger"}
      onCancel={() => onCancel()}
      onOk={onSuccess}
    >
      <Notification type={"warning"} title={`You are about to delete ${rows.length} rows.`}>
        {"This action is not recoverable, the data will be permanently erased"}
      </Notification>
    </Modal>
  );
}

export default DeleteRowsModal;
