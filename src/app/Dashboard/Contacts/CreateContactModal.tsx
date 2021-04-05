import { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { isNil } from "lodash";

import { ClientError, NetworkError, renderFieldErrorsInForm } from "api";
import { Form, ContactForm } from "components/forms";
import { Modal } from "components/modals";
import { createContact } from "api/services";

import { addContactToStateAction } from "../actions";

interface CreateContactModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// TODO: Create front end validators for phone number, city, and country.
const CreateContactModal = ({ open, onCancel, onSuccess }: CreateContactModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();
  const dispatch: Dispatch = useDispatch();

  return (
    <Modal
      title={"Create a New Contact"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      loading={loading}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            setLoading(true);
            createContact(values)
              .then((contact: IContact) => {
                setGlobalError(undefined);
                form.resetFields();
                dispatch(addContactToStateAction(contact));
                onSuccess();
              })
              .catch((e: Error) => {
                if (e instanceof ClientError) {
                  if (!isNil(e.errors.__all__)) {
                    /* eslint-disable no-console */
                    console.error(e.errors.__all__);
                    setGlobalError("There was a problem creating the contact.");
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
      <ContactForm form={form} globalError={globalError} />
    </Modal>
  );
};

export default CreateContactModal;
