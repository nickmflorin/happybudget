import { isNil } from "lodash";

import * as api from "api";

import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";

import Modal from "./Modal";

interface CreateSubAccountGroupModalProps {
  onSuccess: (group: Model.Group) => void;
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
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Sub-Total"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: GroupFormValues) => {
            form.setLoading(true);
            if (!isNil(accountId)) {
              api
                .createAccountSubAccountGroup(accountId, {
                  name: values.name,
                  children: subaccounts,
                  color: values.color
                })
                .then((group: Model.Group) => {
                  form.resetFields();
                  onSuccess(group);
                })
                .catch((e: Error) => form.handleRequestError(e))
                .finally(() => form.setLoading(false));
            } else if (!isNil(subaccountId)) {
              api
                .createSubAccountSubAccountGroup(subaccountId, {
                  name: values.name,
                  children: subaccounts,
                  color: values.color
                })
                .then((group: Model.Group) => {
                  form.resetFields();
                  onSuccess(group);
                })
                .catch((e: Error) => form.handleRequestError(e))
                .finally(() => form.setLoading(false));
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
