import classNames from "classnames";
import { ModalProps as RootModalProps } from "antd/lib/modal";

import { EditAttachments, EditAttachmentsProps } from "components/files";

import { Modal } from "./generic";

interface EditAttachmentsModalProps extends RootModalProps, EditAttachmentsProps {
  readonly open: boolean;
}

const EditAttachmentsModal = ({
  id,
  open,
  path,
  onAttachmentRemoved,
  listAttachments,
  deleteAttachment,
  onAttachmentAdded,
  ...props
}: EditAttachmentsModalProps): JSX.Element => {
  return (
    <Modal
      {...props}
      className={classNames("modal--no-footer", props.className)}
      visible={open}
      destroyOnClose={true}
      getContainer={false}
      title={"Attachments"}
      titleIcon={"paperclip"}
      footer={null}
    >
      <EditAttachments
        path={path}
        id={id}
        onAttachmentAdded={onAttachmentAdded}
        onAttachmentRemoved={onAttachmentRemoved}
        listAttachments={listAttachments}
        deleteAttachment={deleteAttachment}
      />
    </Modal>
  );
};

export default EditAttachmentsModal;
