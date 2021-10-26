import { useEffect, useState } from "react";
import { ModalProps as RootModalProps } from "antd/lib/modal";

import * as api from "api";
import { ui } from "lib";

import { Modal } from "./generic";

interface EditSubAccountAttachmentsModalProps extends RootModalProps {
  readonly id: number;
  readonly open: boolean;
  readonly onSuccess: (m: Model.SubAccount) => void;
  readonly onCancel: () => void;
}

const EditSubAccountAttachmentsModal = ({ id, open, ...props }: EditSubAccountAttachmentsModalProps): JSX.Element => {
  const form = ui.hooks.useForm<Http.GroupPayload>();
  const [cancelToken] = api.useCancelToken();
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachments, setAttachments] = useState<Model.Attachment[]>([]);

  useEffect(() => {
    setLoadingAttachments(true);
    api
      .getSubAccountAttachments(id, {}, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<Model.Attachment>) => {
        setAttachments(response.data);
      })
      .catch((e: Error) => {
        form.handleRequestError(e);
      })
      .finally(() => setLoadingAttachments(false));
  }, [id]);

  return (
    <Modal
      {...props}
      visible={open}
      destroyOnClose={true}
      okText={"Done"}
      cancelText={"Cancel"}
      getContainer={false}
      title={"Attachments"}
      titleIcon={"file-alt"}
      loading={loadingAttachments}
      // title={title}
      // okButtonProps={{ disabled: Form.loading || loading }}
      // onOk={onOk}
    >
      <div>{`Attachments: ${attachments.length} `}</div>
    </Modal>
  );
};

export default EditSubAccountAttachmentsModal;
