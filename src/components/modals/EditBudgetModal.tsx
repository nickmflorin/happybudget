import { updateBudget } from "api/services";
import { Form } from "components";
import { BudgetForm } from "components/forms";
import { BudgetFormValues } from "components/forms/BudgetForm";
import Modal from "./Modal";

interface EditBudgetModalProps {
  budget: Model.Budget;
  onSuccess: (budget: Model.Budget) => void;
  onCancel: () => void;
  open: boolean;
}

const EditBudgetModal = ({ open, budget, onSuccess, onCancel }: EditBudgetModalProps): JSX.Element => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={`Edit ${budget.name}`}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: BudgetFormValues) => {
            form.setLoading(true);
            updateBudget(budget.id, values)
              .then((newBudget: Model.Budget) => {
                form.resetFields();
                onSuccess(newBudget);
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
      <BudgetForm form={form} name={"form_in_modal"} initialValues={{ name: budget.name }} />
    </Modal>
  );
};

export default EditBudgetModal;
