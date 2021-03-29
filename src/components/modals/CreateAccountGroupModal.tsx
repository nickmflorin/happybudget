import { useState } from "react";
import { isNil } from "lodash";

import { ClientError, NetworkError, renderFieldErrorsInForm } from "api";
import { Form, GroupForm } from "components/forms";
import { createAccountGroup } from "services";

import Modal from "./Modal";

interface CreateAccountGroupModalProps {
  onSuccess: (group: IGroup<ISimpleAccount>) => void;
  onCancel: () => void;
  budgetId: number;
  accounts: number[];
  open: boolean;
}

const CreateAccountGroupModal = ({
  budgetId,
  accounts,
  open,
  onSuccess,
  onCancel
}: CreateAccountGroupModalProps): JSX.Element => {
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

            createAccountGroup(budgetId, {
              name: values.name,
              children: accounts,
              color: values.color
            })
              .then((group: IGroup<ISimpleAccount>) => {
                form.resetFields();
                onSuccess(group);
              })
              .catch((e: Error) => {
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
      <GroupForm form={form} name={"form_in_modal"} globalError={globalError} initialValues={{}} />
    </Modal>
  );
};

export default CreateAccountGroupModal;
