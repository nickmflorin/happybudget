import { useState } from "react";
import { isNil } from "lodash";

import { ClientError, NetworkError, renderFieldErrorsInForm, parseGlobalError } from "api";
import { Form } from "components";
import { GroupForm } from "components/forms";
import { GroupFormValues } from "components/forms/GroupForm";
import { updateAccountGroup } from "api/services";

import Modal from "./Modal";

interface EditAccountGroupModalProps {
  onSuccess: (group: IGroup<ISimpleAccount>) => void;
  onCancel: () => void;
  group: IGroup<ISimpleAccount>;
  open: boolean;
}

const EditAccountGroupModal = ({ group, open, onSuccess, onCancel }: EditAccountGroupModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
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
              .then((response: IGroup<ISimpleAccount>) => {
                form.resetFields();
                onSuccess(response);
              })
              .catch((e: Error) => {
                if (e instanceof ClientError) {
                  const global = parseGlobalError(e);
                  if (!isNil(global)) {
                    /* eslint-disable no-console */
                    console.error(e.errors);
                    setGlobalError(global.message);
                  }
                  // Render the errors for each field next to the form field.
                  renderFieldErrorsInForm(form, e);
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
          .catch(() => {
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

export default EditAccountGroupModal;
