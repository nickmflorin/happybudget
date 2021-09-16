import React, { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import * as api from "api";
import { actions } from "store";

import { Form } from "components";
import { ContactForm } from "components/forms";
import { Modal } from "components";

import ContactModalHeader, { IContactModalHeaderRef } from "./ContactModalHeader";
import "./ContactModal.scss";

interface CreateContactModalProps {
  readonly visible: boolean;
  readonly initialValues?: any;
  readonly onCancel: () => void;
  readonly onSuccess: (contact: Model.Contact) => void;
}

const MemoizedContactForm = React.memo(ContactForm);

const CreateContactModal = ({ visible, initialValues, onCancel, onSuccess }: CreateContactModalProps): JSX.Element => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const cancelToken = api.useCancelToken();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<Http.ContactPayload>({ isInModal: true, autoFocusField: 1 });
  const dispatch: Redux.Dispatch = useDispatch();
  /*
  Note: We have to use a ref here, instead of storing firstName and lastName in the state
  of this component, because if we were storing it in this component, when the firstName and
  lastName change it causes the entire component to rerender, and AntD rerenders all form fields
  when the form rerenders, which causes the auto focus to be lost on the first and last name fields.
  */
  const headerRef = useRef<IContactModalHeaderRef | null>(null);

  useEffect(() => {
    return () => {
      headerRef.current?.setFirstName(null);
      headerRef.current?.setLastName(null);
      setImage(null);
      form.resetFields();
    };
  }, []);

  const onValuesChange = useMemo(
    () => (changedValues: Partial<Http.ContactPayload>, values: Http.ContactPayload) => {
      if (!isNil(changedValues.first_name)) {
        headerRef.current?.setFirstName(changedValues.first_name);
      }
      if (!isNil(changedValues.last_name)) {
        headerRef.current?.setLastName(changedValues.last_name);
      }
    },
    []
  );

  return (
    <Modal
      className={"contact-modal"}
      title={
        <ContactModalHeader
          value={image}
          ref={headerRef}
          onChange={(f: UploadedImage | null) => setImage(f)}
          onError={(error: Error | string) => form.setGlobalError(error)}
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
            let payload = { ...values };
            // We have to account for allowing the image to be null, which is the case
            // when we are deleting the image for the contact.
            if (image !== undefined) {
              payload = { ...payload, image: !isNil(image) ? image.data : null };
            }
            setLoading(true);
            api
              .createContact(payload, { cancelToken: cancelToken() })
              .then((contact: Model.Contact) => {
                form.resetFields();
                dispatch(actions.authenticated.addContactToStateAction(contact));
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
      <MemoizedContactForm form={form} initialValues={initialValues} onValuesChange={onValuesChange} />
    </Modal>
  );
};

export default CreateContactModal;
