import { ui, notifications } from "lib";
import { EditAttachments, EditAttachmentsProps } from "deprecated/components/files";

import { Modal } from "./generic";

type EditAttachmentsModalProps = ModalProps &
  Omit<EditAttachmentsProps, "onDownloadError"> & {
    readonly modelId: number;
  };

const EditAttachmentsModal = ({
  modelId,
  path,
  onAttachmentRemoved,
  listAttachments,
  deleteAttachment,
  onAttachmentAdded,
  ...props
}: EditAttachmentsModalProps): JSX.Element => {
  const modal = ui.useModalIfNotDefined(props.modal);

  return (
    <Modal {...props} modal={modal} title="Attachments" titleIcon="paperclip" footer={null}>
      <EditAttachments
        path={path}
        modelId={modelId}
        onAttachmentAdded={onAttachmentAdded}
        onAttachmentRemoved={onAttachmentRemoved}
        listAttachments={listAttachments}
        deleteAttachment={deleteAttachment}
        onDownloadError={(e: Error) => {
          notifications.internal.notify({
            error: e,
            level: "error",
            dispatchToSentry: true,
          });
          modal.current.notify({ message: "There was an error downloading your attachment." });
        }}
      />
    </Modal>
  );
};

export default EditAttachmentsModal;
