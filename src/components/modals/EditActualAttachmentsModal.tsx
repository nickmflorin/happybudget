import { ModalProps as RootModalProps } from "antd/lib/modal";

import * as api from "api";

import EditAttachmentsModal from "./EditAttachmentsModal";

interface EditActualAttachmentsModalProps extends RootModalProps {
  readonly id: number;
  readonly open: boolean;
  readonly onAttachmentAdded?: (m: Model.Attachment) => void;
}

const EditActualAttachmentsModal = (props: EditActualAttachmentsModalProps): JSX.Element => {
  return (
    <EditAttachmentsModal
      {...props}
      listAttachments={api.getActualAttachments}
      uploadAttachment={api.uploadActualAttachment}
      deleteAttachment={api.deleteActualAttachment}
      path={`/v1/actuals/${props.id}/attachments/`}
    />
  );
};

export default EditActualAttachmentsModal;
