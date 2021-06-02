import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";
import { updateGroup } from "api/services";

import Modal from "./Modal";

interface EditSubAccountGroupModalProps<G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup> {
  onSuccess: (group: G) => void;
  onCancel: () => void;
  group: G;
  open: boolean;
}

const EditSubAccountGroupModal = <G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup>({
  group,
  open,
  onSuccess,
  onCancel
}: EditSubAccountGroupModalProps<G>): JSX.Element => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Edit Sub-Total"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      okButtonProps={{ disabled: form.loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: GroupFormValues) => {
            form.setLoading(true);
            updateGroup<G>(group.id, values)
              .then((response: G) => {
                form.resetFields();
                onSuccess(response);
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
      <GroupForm form={form} name={"form_in_modal"} initialValues={{ name: group.name, color: group.color }} />
    </Modal>
  );
};

export default EditSubAccountGroupModal;
