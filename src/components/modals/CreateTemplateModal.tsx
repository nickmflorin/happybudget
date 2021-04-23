import { useState } from "react";
import { isNil } from "lodash";

import { createTemplate } from "api/services";
import { payloadToFormData } from "lib/util/forms";
import { Form } from "components";
import { TemplateForm } from "components/forms";
import { TemplateFormValues } from "components/forms/TemplateForm";

import Modal from "./Modal";

interface CreateTemplateModalProps {
  onSuccess: (template: Model.Template) => void;
  onCancel: () => void;
  open: boolean;
}

const CreateTemplateModal = ({ open, onSuccess, onCancel }: CreateTemplateModalProps): JSX.Element => {
  const [file, setFile] = useState<File | Blob | null>(null);
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Template"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: TemplateFormValues) => {
            let payload: Http.TemplatePayload = { ...values };
            if (!isNil(file)) {
              payload = { ...payload, image: file };
            }
            const formData = payloadToFormData<Http.BudgetPayload>(payload);
            form.setLoading(true);
            createTemplate(formData)
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
      <TemplateForm
        form={form}
        onImageChange={(f: File | Blob) => setFile(f)}
        name={"form_in_modal"}
        initialValues={{}}
      />
    </Modal>
  );
};

export default CreateTemplateModal;
