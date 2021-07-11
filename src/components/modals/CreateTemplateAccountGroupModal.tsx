import * as api from "api";

import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";

import Modal from "./Modal";

interface CreateTemplateAccountGroupModalProps {
  onSuccess: (group: Model.Group) => void;
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
      okButtonProps={{ disabled: form.loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: GroupFormValues) => {
            form.setLoading(true);

            api
              .createTemplateAccountGroup(templateId, {
                name: values.name,
                children: accounts,
                color: values.color
              })
              .then((group: Model.Group) => {
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
