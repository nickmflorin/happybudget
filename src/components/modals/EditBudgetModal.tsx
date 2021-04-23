import { useState } from "react";
import { isNil } from "lodash";

import { updateBudget } from "api/services";
import { payloadToFormData } from "lib/util/forms";
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
  const [file, setFile] = useState<File | Blob | null>(null);
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
            let payload: Http.BudgetPayload = { ...values };
            if (!isNil(file)) {
              payload = { ...payload, image: file };
            }
            const formData = payloadToFormData<Http.BudgetPayload>(payload);
            form.setLoading(true);
            updateBudget(budget.id, formData)
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
      <BudgetForm
        form={form}
        name={"form_in_modal"}
        onImageChange={(f: File | Blob) => setFile(f)}
        imageUrl={budget.image}
        initialValues={{ name: budget.name }}
      />
    </Modal>
  );
};

export default EditBudgetModal;
