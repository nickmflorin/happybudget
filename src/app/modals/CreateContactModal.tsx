import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import * as api from "api";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components/modals";

import { addContactToStateAction } from "store/actions";

interface CreateContactModalProps {
  readonly visible: boolean;
  readonly initialValues?: any;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
}

const CreateContactModal = ({ visible, initialValues, onCancel, onSuccess }: CreateContactModalProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<Http.ContactPayload>({ isInModal: true });
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    form.resetFields();
  }, [visible]);

  return (
    <Modal
      title={"Create a New Contact"}
      visible={visible}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      loading={loading}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.ContactPayload) => {
            setLoading(true);
            api
              .createContact(values)
              .then((contact: Model.Contact) => {
                form.resetFields();
                dispatch(addContactToStateAction(contact));
                onSuccess();
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
      <ContactForm form={form} initialValues={initialValues} />
    </Modal>
  );
};

export default CreateContactModal;
