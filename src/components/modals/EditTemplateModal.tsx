import { useState } from "react";
import { isNil } from "lodash";

import { updateTemplate } from "api/services";
import { getBase64 } from "lib/util/files";
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
      okButtonProps={{ disabled: form.loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: TemplateFormValues) => {
            const submit = (payload: Partial<Http.TemplatePayload>) => {
              form.setLoading(true);
              updateTemplate(template.id, payload)
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
            };
            if (!isNil(file)) {
              getBase64(file, (result: ArrayBuffer | string | null) => {
                if (result !== null) {
                  submit({ ...values, image: result });
                }
              });
            } else {
              submit(values);
            }
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
