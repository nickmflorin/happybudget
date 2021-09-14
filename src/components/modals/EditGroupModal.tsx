import { useEffect } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { model } from "lib";

import { Form } from "components";
import { GroupForm } from "components/forms";

import Modal from "./Modal";

interface EditGroupModalProps {
  onSuccess: (group: Model.BudgetGroup) => void;
  onCancel: () => void;
  groupId: ID;
  open: boolean;
}

const EditGroupModal = ({ groupId, open, onSuccess, onCancel }: EditGroupModalProps): JSX.Element => {
  const [form] = Form.useForm<Http.GroupPayload>({ isInModal: true });
  const [group, loading, error] = model.hooks.useGroup(groupId, {
    conditional: () => open === true,
    deps: [open]
  });

  useEffect(() => {
    form.setLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (!isNil(error)) {
      form.setGlobalError(error);
    }
  }, [error]);

  useEffect(() => {
    if (!isNil(group)) {
      form.setFields([
        { name: "name", value: group.name },
        { name: "color", value: group.color }
      ]);
    }
  }, [group]);

  return (
    <Modal.Modal
      title={"Edit Sub-Total"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      getContainer={false}
      okButtonProps={{ disabled: form.loading || loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.GroupPayload) => {
            form.setLoading(true);
            api
              .updateGroup(groupId, values)
              .then((response: Model.BudgetGroup) => {
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
      <GroupForm form={form} />
    </Modal.Modal>
  );
};

export default EditGroupModal;
