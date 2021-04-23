import { useState } from "react";
import { isNil } from "lodash";

import { updateTemplate } from "api/services";
import { payloadToFormData } from "lib/util/forms";
import { Form } from "components";
import { TemplateForm } from "components/forms";
import { TemplateFormValues } from "components/forms/TemplateForm";
import Modal from "./Modal";

interface EditTemplateModalProps {
  template: Model.Template;
  onSuccess: (template: Model.Template) => void;
  onCancel: () => void;
  open: boolean;
}

const EditTemplateModal = ({ open, template, onSuccess, onCancel }: EditTemplateModalProps): JSX.Element => {
  const [file, setFile] = useState<File | Blob | null>(null);
  const [form] = Form.useForm();

  return (
    <Modal
      title={`Edit ${template.name}`}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: TemplateFormValues) => {
            let payload: Http.TemplatePayload = { ...values };
            if (!isNil(file)) {
              payload = { ...payload, image: file };
            }
            console.log(payload);
            const formData = payloadToFormData<Http.TemplatePayload>(payload);
            form.setLoading(true);
            updateTemplate(template.id, formData)
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
        name={"form_in_modal"}
        onImageChange={(f: File | Blob) => setFile(f)}
        imageUrl={template.image}
        initialValues={{ name: template.name }}
      />
    </Modal>
  );
};

export default EditTemplateModal;
