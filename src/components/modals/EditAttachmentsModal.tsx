import { ui } from "lib";
import { EditAttachments, EditAttachmentsProps } from "components/files";

import { Modal } from "./generic";

interface EditAttachmentsModalProps extends ModalProps, Omit<EditAttachmentsProps, "onError"> {}

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
        onError={(notification: UINotificationData) => modal.current.notify(notification)}
      />
    </Modal>
  );
};

export default EditAttachmentsModal;
