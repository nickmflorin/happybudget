import { useState } from "react";
import { isNil } from "lodash";

import { createBudget } from "api/services";
import { payloadToFormData } from "lib/util/forms";
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
  const [file, setFile] = useState<File | Blob | null>(null);
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
            let payload: Http.BudgetPayload = { ...values };
            if (!isNil(file)) {
              payload = { ...payload, image: file };
            }
            if (!isNil(templateId)) {
              payload = { ...payload, template: templateId };
            }
            const formData = payloadToFormData<Http.BudgetPayload>(payload);
            form.setLoading(true);
            createBudget(formData)
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
      <BudgetForm
        form={form}
        onImageChange={(f: File | Blob) => setFile(f)}
        name={"form_in_modal"}
        initialValues={{}}
      />
    </Modal>
  );
};

export default CreateBudgetModal;
