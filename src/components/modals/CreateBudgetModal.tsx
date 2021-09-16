import { useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { Form } from "components";
import { BudgetForm } from "components/forms";

import { Modal } from "./generic";

interface CreateBudgetModalProps {
  onSuccess: (budget: Model.Budget) => void;
  onCancel: () => void;
  open: boolean;
  templateId?: number;
  title?: string;
}

const CreateBudgetModal = ({
  open,
  templateId,
  title = "Create Budget",
  onSuccess,
  onCancel
}: CreateBudgetModalProps): JSX.Element => {
  const [file, setFile] = useState<UploadedImage | null>(null);
  const [form] = Form.useForm<Http.BudgetPayload>({ isInModal: true });
  const cancelToken = api.useCancelToken();

  return (
    <Modal
      title={title}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      getContainer={false}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.BudgetPayload) => {
            if (!isNil(templateId)) {
              values = { ...values, template: templateId };
            }
            form.setLoading(true);
            api
              .createBudget({ ...values, image: !isNil(file) ? file.data : null }, { cancelToken: cancelToken() })
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
      <BudgetForm form={form} onImageChange={(f: UploadedImage | null) => setFile(f)} initialValues={{}} />
    </Modal>
  );
};

export default CreateBudgetModal;
