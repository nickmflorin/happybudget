import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import * as api from "api";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components";

import { addContactToStateAction } from "store/actions";

import ContactModalHeader from "./ContactModalHeader";
import "./ContactModal.scss";

interface CreateContactModalProps {
  readonly visible: boolean;
  readonly initialValues?: any;
  readonly onCancel: () => void;
  readonly onSuccess: (contact: Model.Contact) => void;
}

const CreateContactModal = ({ visible, initialValues, onCancel, onSuccess }: CreateContactModalProps): JSX.Element => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<Http.ContactPayload>({ isInModal: true, autoFocusField: 1 });
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    if (visible === true) {
      form.resetFields();
    }
  }, [visible]);

  return (
    <Modal.Modal
      className={"contact-modal"}
      title={
        <ContactModalHeader
          value={image}
          onChange={(f: UploadedImage | null) => setImage(f)}
          onError={(error: Error | string) => form.setGlobalError(error)}
          firstName={firstName}
          lastName={lastName}
        />
      }
      visible={visible}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      loading={loading}
      getContainer={false}
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
                onSuccess(contact);
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
      <ContactForm
        form={form}
        initialValues={initialValues}
        onFirstNameChange={(value: string) => setFirstName(value)}
        onLastNameChange={(value: string) => setLastName(value)}
      />
    </Modal.Modal>
  );
};

export default CreateContactModal;
