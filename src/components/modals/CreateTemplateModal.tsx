import { useState } from "react";

import { createTemplate } from "api/services";
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
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Template"}
      visible={open}
      loading={loading}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: TemplateFormValues) => {
            setLoading(true);
            createTemplate(values)
              .then((template: Model.Template) => {
                form.resetFields();
                onSuccess(template);
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                setLoading(false);
              });
          })
          .catch(() => {
            return;
          });
      }}
    >
      <TemplateForm form={form} name={"form_in_modal"} initialValues={{}} />
    </Modal>
  );
};

export default CreateTemplateModal;
