import * as api from "api";

import { Form } from "components";
import { GroupForm } from "components/forms";

import Modal from "./Modal";

interface EditSubAccountGroupModalProps {
  onSuccess: (group: Model.Group) => void;
  onCancel: () => void;
  group: Model.Group;
  open: boolean;
}

const EditSubAccountGroupModal = ({ group, open, onSuccess, onCancel }: EditSubAccountGroupModalProps): JSX.Element => {
  const [form] = Form.useForm<Http.GroupPayload>({ isInModal: true });

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
          .then((values: Http.GroupPayload) => {
            form.setLoading(true);
            api
              .updateGroup(group.id, values)
              .then((response: Model.Group) => {
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
      <GroupForm form={form} initialValues={{ name: group.name, color: group.color }} />
    </Modal>
  );
};

export default EditSubAccountGroupModal;
