import { useState } from "react";
import { isNil } from "lodash";

import { createAccountSubAccountGroup, createSubAccountSubAccountGroup } from "api/services";
import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";

import Modal from "./Modal";

interface CreateSubAccountGroupModalProps {
  onSuccess: (group: Model.Group<Model.SimpleSubAccount>) => void;
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
            if (!isNil(accountId)) {
              createAccountSubAccountGroup(accountId, {
                name: values.name,
                children: subaccounts,
                color: values.color
              })
                .then((group: Model.Group<Model.SimpleSubAccount>) => {
                  form.resetFields();
                  onSuccess(group);
                })
                .catch((e: Error) => form.handleRequestError(e))
                .finally(() => setLoading(false));
            } else if (!isNil(subaccountId)) {
              createSubAccountSubAccountGroup(subaccountId, {
                name: values.name,
                children: subaccounts,
                color: values.color
              })
                .then((group: Model.Group<Model.SimpleSubAccount>) => {
                  form.resetFields();
                  onSuccess(group);
                })
                .catch((e: Error) => form.handleRequestError(e))
                .finally(() => setLoading(false));
            }
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

export default CreateSubAccountGroupModal;
