import { useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
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
  const [file, setFile] = useState<UploadedImage | null>(null);
  const [form] = Form.useForm<Http.BudgetPayload>({ isInModal: true });

  return (
    <Modal.Modal
      title={`Edit ${budget.name}`}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      getContainer={false}
      okButtonProps={{ disabled: form.loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.BudgetPayload) => {
            form.setLoading(true);
            api
              .updateBudget(budget.id, { ...values, image: !isNil(file) ? file.data : null })
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
        onImageChange={(f: UploadedImage | null) => setFile(f)}
        originalImage={budget.image}
        initialValues={{ name: budget.name }}
      />
    </Modal.Modal>
  );
};

export default EditBudgetModal;
