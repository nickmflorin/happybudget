import { useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { Form } from "components";
import { TemplateForm } from "components/forms";
import Modal from "./Modal";

interface EditTemplateModalProps {
  template: Model.Template;
  onSuccess: (template: Model.Template) => void;
  onCancel: () => void;
  open: boolean;
}

const EditTemplateModal = ({ open, template, onSuccess, onCancel }: EditTemplateModalProps): JSX.Element => {
  const [file, setFile] = useState<UploadedImage | null>(null);
  const [form] = Form.useForm<Http.TemplatePayload>({ isInModal: true });

  return (
    <Modal.Modal
      title={`Edit ${template.name}`}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      getContainer={false}
      okButtonProps={{ disabled: form.loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.TemplatePayload) => {
            form.setLoading(true);
            api
              .updateTemplate(template.id, { ...values, image: !isNil(file) ? file.data : null })
              .then((newTemplate: Model.Template) => {
                form.resetFields();
                onSuccess(newTemplate);
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
      <TemplateForm
        form={form}
        onImageChange={(f: UploadedImage | null) => setFile(f)}
        originalImage={template.image}
        initialValues={{ name: template.name }}
      />
    </Modal.Modal>
  );
};

export default EditTemplateModal;
