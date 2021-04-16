import { isNil } from "lodash";

import { createAccountSubAccountGroup, createSubAccountSubAccountGroup } from "api/services";
import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";

import Modal from "./Modal";

interface CreateSubAccountGroupModalProps<G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup> {
  onSuccess: (group: G) => void;
  onCancel: () => void;
  accountId?: number;
  subaccountId?: number;
  subaccounts: number[];
  open: boolean;
}

const CreateSubAccountGroupModal = <G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup>({
  accountId,
  subaccountId,
  open,
  subaccounts,
  onSuccess,
  onCancel
}: CreateSubAccountGroupModalProps<G>): JSX.Element => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Sub-Total"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: GroupFormValues) => {
            form.setLoading(true);
            if (!isNil(accountId)) {
              createAccountSubAccountGroup<G>(accountId, {
                name: values.name,
                children: subaccounts,
                color: values.color
              })
                .then((group: G) => {
                  form.resetFields();
                  onSuccess(group);
                })
                .catch((e: Error) => form.handleRequestError(e))
                .finally(() => form.setLoading(false));
            } else if (!isNil(subaccountId)) {
              createSubAccountSubAccountGroup<G>(subaccountId, {
                name: values.name,
                children: subaccounts,
                color: values.color
              })
                .then((group: G) => {
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
