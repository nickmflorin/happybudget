import { ModalProps as RootModalProps } from "antd/lib/modal";

import * as api from "api";

import EditAttachmentsModal from "./EditAttachmentsModal";

interface EditSubAccountAttachmentsModalProps extends RootModalProps {
  readonly id: number;
  readonly open: boolean;
  readonly onAttachmentAdded?: (m: Model.Attachment) => void;
  readonly onAttachmentRemoved?: (id: number) => void;
}

const EditSubAccountAttachmentsModal = (props: EditSubAccountAttachmentsModalProps): JSX.Element => {
  return (
    <EditAttachmentsModal
      {...props}
      listAttachments={api.getSubAccountAttachments}
      uploadAttachment={api.uploadSubAccountAttachment}
      deleteAttachment={api.deleteSubAccountAttachment}
      path={`/v1/subaccounts/${props.id}/attachments/`}
    />
  );
};

export default EditSubAccountAttachmentsModal;
