import { useState } from "react";

import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";
import { updateAccountGroup } from "api/services";

import Modal from "./Modal";

interface EditAccountGroupModalProps {
  onSuccess: (group: Model.Group<Model.SimpleAccount>) => void;
  onCancel: () => void;
  group: Model.Group<Model.SimpleAccount>;
  open: boolean;
}

const EditAccountGroupModal = ({ group, open, onSuccess, onCancel }: EditAccountGroupModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Edit Sub-Total"}
      visible={open}
      loading={loading}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: GroupFormValues) => {
            setLoading(true);

            updateAccountGroup(group.id, {
              name: values.name,
              color: values.color
            })
              .then((response: Model.Group<Model.SimpleAccount>) => {
                form.resetFields();
                onSuccess(response);
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
      <GroupForm form={form} name={"form_in_modal"} initialValues={{ name: group.name, color: group.color }} />
    </Modal>
  );
};

export default EditAccountGroupModal;
