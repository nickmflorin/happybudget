import { useState } from "react";

import { Input } from "antd";

import { Form } from "components";
import { createBudget } from "api/services";

import Modal from "./Modal";

interface CreateBudgetModalProps {
  onSuccess: (budget: IBudget) => void;
  onCancel: () => void;
  open: boolean;
  productionType: ProductionTypeId;
}

const CreateBudgetModal = ({ productionType, open, onSuccess, onCancel }: CreateBudgetModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Budget"}
      visible={open}
      loading={loading}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: any) => {
            setLoading(true);
            createBudget({ name: values.name, production_type: productionType })
              .then((budget: IBudget) => {
                form.resetFields();
                onSuccess(budget);
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                setLoading(false);
              });
          })
          .catch(() => {
            return;
          });
      }}
    >
      <Form.Form form={form} layout={"vertical"} name={"form_in_modal"} initialValues={{}}>
        <Form.Item
          name={"name"}
          label={"Name"}
          rules={[{ required: true, message: "Please provide a valid budget name." }]}
        >
          <Input placeholder={"Name"} />
        </Form.Item>
      </Form.Form>
    </Modal>
  );
};

export default CreateBudgetModal;
