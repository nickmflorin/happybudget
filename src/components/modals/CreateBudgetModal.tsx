import { isNil } from "lodash";
import { createBudget } from "api/services";
import { Form } from "components";
import { BudgetForm } from "components/forms";
import { BudgetFormValues } from "components/forms/BudgetForm";

import Modal from "./Modal";

interface CreateBudgetModalProps {
  onSuccess: (budget: Model.Budget) => void;
  onCancel: () => void;
  open: boolean;
  templateId?: number;
}

const CreateBudgetModal = ({ open, templateId, onSuccess, onCancel }: CreateBudgetModalProps): JSX.Element => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Budget"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: BudgetFormValues) => {
            form.setLoading(true);
            let payload: Http.BudgetPayload = { ...values };
            if (!isNil(templateId)) {
              payload = { ...payload, template: templateId };
            }
            createBudget(payload)
              .then((budget: Model.Budget) => {
                form.resetFields();
                onSuccess(budget);
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
      <BudgetForm form={form} name={"form_in_modal"} initialValues={{}} />
    </Modal>
  );
};

export default CreateBudgetModal;
