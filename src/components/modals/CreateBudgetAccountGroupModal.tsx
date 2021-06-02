import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";
import { createBudgetAccountGroup } from "api/services";

import Modal from "./Modal";

interface CreateBudgetAccountGroupModalProps {
  onSuccess: (group: Model.BudgetGroup) => void;
  onCancel: () => void;
  budgetId: number;
  accounts: number[];
  open: boolean;
}

const CreateBudgetAccountGroupModal = ({
  budgetId,
  accounts,
  open,
  onSuccess,
  onCancel
}: CreateBudgetAccountGroupModalProps): JSX.Element => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Sub-Total"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: GroupFormValues) => {
            form.setLoading(true);
            createBudgetAccountGroup(budgetId, {
              name: values.name,
              children: accounts,
              color: values.color
            })
              .then((group: Model.BudgetGroup) => {
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

export default CreateBudgetAccountGroupModal;
