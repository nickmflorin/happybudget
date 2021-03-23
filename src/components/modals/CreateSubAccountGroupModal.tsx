import { useState } from "react";
import { isNil } from "lodash";

import { Input } from "antd";

import { ClientError, NetworkError, renderFieldErrorsInForm } from "api";
import { ColorSelect } from "components/control";
import { Form } from "components/forms";
import { createAccountSubAccountGroup, createSubAccountSubAccountGroup } from "services";

import Modal from "./Modal";

interface CreateSubAccountGroupModalProps {
  onSuccess: (group: ISubAccountGroup) => void;
  onCancel: () => void;
  accountId?: number;
  subaccountId?: number;
  subaccounts: number[];
  open: boolean;
}

const CreateSubAccountGroupModal = ({
  accountId,
  subaccountId,
  open,
  subaccounts,
  onSuccess,
  onCancel
}: CreateSubAccountGroupModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Group"}
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

            const handleError = (e: Error) => {
              if (e instanceof ClientError) {
                if (!isNil(e.errors.__all__)) {
                  /* eslint-disable no-console */
                  console.error(e.errors.__all__);
                  setGlobalError(e.errors.__all__[0].message);
                } else {
                  // Render the errors for each field next to the form field.
                  renderFieldErrorsInForm(form, e);
                }
              } else if (e instanceof NetworkError) {
                setGlobalError("There was a problem communicating with the server.");
              } else {
                throw e;
              }
            };
            if (!isNil(accountId)) {
              createAccountSubAccountGroup(accountId, { name: values.name, subaccounts: subaccounts })
                .then((group: ISubAccountGroup) => {
                  form.resetFields();
                  onSuccess(group);
                })
                .catch((e: Error) => handleError(e))
                .finally(() => setLoading(false));
            } else if (!isNil(subaccountId)) {
              createSubAccountSubAccountGroup(subaccountId, { name: values.name, subaccounts: subaccounts })
                .then((group: ISubAccountGroup) => {
                  form.resetFields();
                  onSuccess(group);
                })
                .catch((e: Error) => handleError(e))
                .finally(() => setLoading(false));
            }
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
          rules={[{ required: true, message: "Please provide a valid name for the group." }]}
        >
          <Input placeholder={"Name"} />
        </Form.Item>
        <Form.Item
          name={"color"}
          label={"Color"}
          rules={[{ required: true, message: "Please select a color for the group." }]}
        >
          <ColorSelect
            colors={[
              "#797695",
              "#ff7165",
              "#80cbc4",
              "#ce93d8",
              "#fed835",
              "#c87987",
              "#69f0ae",
              "#a1887f",
              "#81d4fa",
              "#f75776",
              "#66bb6a",
              "#58add6"
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSubAccountGroupModal;
