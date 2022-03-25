import { ui } from "lib";
import { EditAttachments, EditAttachmentsProps } from "components/files";

import { notifications } from "lib";
import { Modal } from "./generic";

interface EditAttachmentsModalProps extends ModalProps, Omit<EditAttachmentsProps, "onDownloadError"> {}

const EditAttachmentsModal = ({
  id,
  path,
  onAttachmentRemoved,
  listAttachments,
  deleteAttachment,
  onAttachmentAdded,
  ...props
}: EditAttachmentsModalProps): JSX.Element => {
  const modal = ui.useModalIfNotDefined(props.modal);

  return (
    <Modal {...props} modal={modal} title={"Attachments"} titleIcon={"paperclip"} footer={null}>
      <EditAttachments
        path={path}
        id={id}
        onAttachmentAdded={onAttachmentAdded}
        onAttachmentRemoved={onAttachmentRemoved}
        listAttachments={listAttachments}
        deleteAttachment={deleteAttachment}
        onDownloadError={(e: Error) => {
          notifications.internal.notify({
            error: e,
            level: "error",
            dispatchToSentry: true
          });
          modal.current.notify({ message: "There was an error downloading your attachment." });
        }}
      />
    </Modal>
  );
};

export default EditAttachmentsModal;
