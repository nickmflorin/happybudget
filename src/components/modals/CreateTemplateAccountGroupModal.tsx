import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";
import { createTemplateAccountGroup } from "api/services";

import Modal from "./Modal";

interface CreateTemplateAccountGroupModalProps {
  onSuccess: (group: Model.TemplateGroup) => void;
  onCancel: () => void;
  templateId: number;
  accounts: number[];
  open: boolean;
}

const CreateTemplateAccountGroupModal = ({
  templateId,
  accounts,
  open,
  onSuccess,
  onCancel
}: CreateTemplateAccountGroupModalProps): JSX.Element => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Sub-Total"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: GroupFormValues) => {
            form.setLoading(true);

            createTemplateAccountGroup(templateId, {
              name: values.name,
              children: accounts,
              color: values.color
            })
              .then((group: Model.TemplateGroup) => {
                form.resetFields();
                onSuccess(group);
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
      <GroupForm form={form} name={"form_in_modal"} initialValues={{}} />
    </Modal>
  );
};

export default CreateTemplateAccountGroupModal;
