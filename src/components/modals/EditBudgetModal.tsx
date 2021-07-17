import { useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { getBase64 } from "lib/util/files";
import { Form } from "components";
import { BudgetForm } from "components/forms";
import Modal from "./Modal";

interface EditBudgetModalProps {
  budget: Model.Budget;
  onSuccess: (budget: Model.Budget) => void;
  onCancel: () => void;
  open: boolean;
}

const EditBudgetModal = ({ open, budget, onSuccess, onCancel }: EditBudgetModalProps): JSX.Element => {
  const [file, setFile] = useState<File | Blob | null>(null);
  const [form] = Form.useForm<Http.BudgetPayload>({ isInModal: true });

  return (
    <Modal
      title={`Edit ${budget.name}`}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      okButtonProps={{ disabled: form.loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.BudgetPayload) => {
            const submit = (payload: Http.BudgetPayload) => {
              form.setLoading(true);
              api
                .updateBudget(budget.id, payload)
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
        onImageChange={(f: File | Blob) => setFile(f)}
        imageUrl={budget.image}
        initialValues={{ name: budget.name }}
      />
    </Modal>
  );
};

export default EditBudgetModal;
