import { useState } from "react";
import { isNil } from "lodash";

import { updateBudget } from "api/services";
import { getBase64 } from "lib/util/files";
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
            const submit = (payload: Http.BudgetPayload) => {
              updateBudget(budget.id, payload)
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
