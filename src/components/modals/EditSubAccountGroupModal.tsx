import { useState } from "react";

import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";
import { updateSubAccountGroup } from "api/services";

import Modal from "./Modal";

interface EditSubAccountGroupModalProps {
  onSuccess: (group: IGroup<ISimpleSubAccount>) => void;
  onCancel: () => void;
  group: IGroup<ISimpleSubAccount>;
  open: boolean;
}

const EditSubAccountGroupModal = ({ group, open, onSuccess, onCancel }: EditSubAccountGroupModalProps): JSX.Element => {
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
            updateSubAccountGroup(group.id, values)
              .then((response: IGroup<ISimpleSubAccount>) => {
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

export default EditSubAccountGroupModal;
