import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { tabling } from "lib";

import { Notification } from "components/notifications";

import { DeleteModal } from "./generic";

interface DeleteRowsModalProps extends ModalProps {
  readonly rows: Model.Model[];
}

function DeleteRowsModal({ rows, ...props }: DeleteRowsModalProps): JSX.Element {
  return (
    <DeleteModal {...props} className={"delete-rows-modal"} title={"Delete Rows"}>
      <>
        <Notification bare={true} level={"warning"} message={`You are about to delete ${rows.length} rows.`}>
          {"This action is not recoverable, the data will be permanently erased"}
        </Notification>
        <Checkbox
          style={{ display: "flex", alignItems: "center", marginTop: "10px" }}
          onChange={(e: CheckboxChangeEvent) => {
            tabling.cookies.setDeleteModalConfirmationSuppression(e.target.checked);
          }}
        >
          {"Don't show this message again"}
        </Checkbox>
      </>
    </DeleteModal>
  );
}

export default DeleteRowsModal;
