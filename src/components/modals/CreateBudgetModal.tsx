import { useState } from "react";
import { isNil } from "lodash";

import { Input } from "antd";

import { ClientError, NetworkError, renderFieldErrorsInForm, parseGlobalError } from "api";
import { Form } from "components/forms";
import { createBudget } from "api/services";

import Modal from "./Modal";

interface CreateBudgetModalProps {
  onSuccess: (budget: IBudget) => void;
  onCancel: () => void;
  open: boolean;
  productionType: ProductionType;
}

const CreateBudgetModal = ({ productionType, open, onSuccess, onCancel }: CreateBudgetModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
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
          .then(values => {
            setLoading(true);
            createBudget({ name: values.name, production_type: productionType })
              .then((budget: IBudget) => {
                form.resetFields();
                onSuccess(budget);
              })
              .catch((e: Error) => {
                if (e instanceof ClientError) {
                  const global = parseGlobalError(e);
                  if (!isNil(global)) {
                    /* eslint-disable no-console */
                    console.error(e.errors);
                    setGlobalError(global.message);
                  }
                  // Render the errors for each field next to the form field.
                  renderFieldErrorsInForm(form, e);
                } else if (e instanceof NetworkError) {
                  setGlobalError("There was a problem communicating with the server.");
                } else {
                  throw e;
                }
              })
              .finally(() => {
                setLoading(false);
              });
          })
          .catch(info => {
            return;
          });
      }}
    >
      <Form form={form} layout={"vertical"} name={"form_in_modal"} globalError={globalError} initialValues={{}}>
        <Form.Item
          name={"name"}
          label={"Name"}
          rules={[{ required: true, message: "Please provide a valid budget name." }]}
        >
          <Input placeholder={"Name"} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateBudgetModal;
