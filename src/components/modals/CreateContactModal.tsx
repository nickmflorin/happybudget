import React, { useMemo, useState, useEffect, useRef } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { ui } from "lib";
import { ContactForm } from "components/forms";
import { ImageAndName } from "components/fields";
import { IImageAndNameRef } from "components/fields/ImageAndName";

import { CreateModelModal, CreateModelModalProps } from "./generic";

interface CreateContactModalProps extends CreateModelModalProps<Model.Contact> {
  readonly initialValues?: Partial<Http.ContactPayload>;
}

const MemoizedContactForm = React.memo(ContactForm);

const CreateContactModal = ({ initialValues, ...props }: CreateContactModalProps): JSX.Element => {
  const form = ui.hooks.useForm<Http.ContactPayload>();
  const [image, setImage] = useState<UploadedImage | null>(null);
  /*
  Note: We have to use a ref here, instead of storing firstName and lastName in
	the state of this component, because if we were storing it in this component,
	when the firstName and lastName change it causes the entire component to
	rerender, and AntD rerenders all form fields when the form rerenders, which
	causes the auto focus to be lost on the first and last name fields.
  */
  const headerRef = useRef<IImageAndNameRef | null>(null);

  useEffect(() => {
    const firstName = initialValues?.first_name;
    if (!isNil(firstName)) {
      headerRef.current?.setFirstName(firstName);
    }
    const lastName = initialValues?.last_name;
    if (!isNil(lastName)) {
      headerRef.current?.setLastName(lastName);
    }
    return () => {
      headerRef.current?.setFirstName(null);
      headerRef.current?.setLastName(null);
      setImage(null);
    };
  }, [initialValues, headerRef.current]);

  const onValuesChange = useMemo(
    () => (changedValues: Partial<Http.ContactPayload>) => {
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
    <CreateModelModal<Model.Contact>
      {...props}
      className={"contact-modal"}
      form={form}
      title={
        <ImageAndName
          value={image}
          ref={headerRef}
          onChange={(f: UploadedImage | null) => setImage(f)}
          onError={(error: Error | string) => form.notify(typeof error === "string" ? error : error.message)}
        />
      }
      interceptPayload={(p: Http.ContactPayload) => {
        if (image !== undefined) {
          return { ...p, image: !isNil(image) ? image.data : null };
        }
        return p;
      }}
      create={api.createContact}
    >
      {() => <MemoizedContactForm form={form} initialValues={initialValues} onValuesChange={onValuesChange} />}
    </CreateModelModal>
  );
};

export default CreateContactModal;
