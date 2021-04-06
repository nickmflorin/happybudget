import { useState } from "react";
import { isNil } from "lodash";

import { ClientError, NetworkError, renderFieldErrorsInForm } from "api";
import { Form, GroupForm } from "components/forms";
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
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Edit Group"}
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
      <GroupForm
        form={form}
        name={"form_in_modal"}
        globalError={globalError}
        initialValues={{ name: group.name, color: group.color }}
      />
    </Modal>
  );
};

export default EditSubAccountGroupModal;
