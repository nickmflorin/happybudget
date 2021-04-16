import { updateTemplate } from "api/services";
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
            form.setLoading(true);
            updateTemplate(template.id, values)
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
      <TemplateForm form={form} name={"form_in_modal"} initialValues={{ name: template.name }} />
    </Modal>
  );
};

export default EditTemplateModal;
