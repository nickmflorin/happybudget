import { useState } from "react";

import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";
import { createAccountGroup } from "api/services";

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
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Sub-Total"}
      visible={open}
      loading={loading}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: GroupFormValues) => {
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
      <GroupForm form={form} name={"form_in_modal"} initialValues={{}} />
    </Modal>
  );
};

export default CreateAccountGroupModal;
