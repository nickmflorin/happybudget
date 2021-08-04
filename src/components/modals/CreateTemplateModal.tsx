import { useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { Form } from "components";
import { TemplateForm } from "components/forms";
import { useLoggedInUser } from "store/hooks";

import Modal from "./Modal";

interface CreateTemplateModalProps {
  onSuccess: (template: Model.Template) => void;
  onCancel: () => void;
  community?: boolean;
  open: boolean;
}

const CreateTemplateModal = ({
  open,
  community = false,
  onSuccess,
  onCancel
}: CreateTemplateModalProps): JSX.Element => {
  const user = useLoggedInUser();
  const [file, setFile] = useState<UploadedImage | null>(null);
  const [form] = Form.useForm<Http.TemplatePayload>({ isInModal: true });

  return (
    <Modal.Modal
      title={"Create Template"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      getContainer={false}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.TemplatePayload) => {
            let service = api.createTemplate;
            if (community === true && user.is_staff === true) {
              service = api.createCommunityTemplate;
            }
            form.setLoading(true);
            service({ ...values, image: !isNil(file) ? file.data : null })
              .then((template: Model.Template) => {
                form.resetFields();
                onSuccess(template);
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                form.setLoading(false);
              });
          })
          .catch(() => {
            return;
          });
      }}
    >
      <TemplateForm form={form} onImageChange={(f: UploadedImage | null) => setFile(f)} initialValues={{}} />
    </Modal.Modal>
  );
};

export default CreateTemplateModal;
