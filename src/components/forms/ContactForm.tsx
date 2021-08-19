import React from "react";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons";

import { model } from "lib";

import { Form } from "components";
import { Input, Select } from "components/fields";
import { FormProps } from "components/forms/Form";
import { PhoneNumberInput } from "../fields";
import "./ContactForm.scss";

interface ContactFormProps extends FormProps<Http.ContactPayload> {
  // These are needed so that the ContactModal can hook into them and displayed the
  // updated name in real time.
  readonly onFirstNameChange: (value: string) => void;
  readonly onLastNameChange: (value: string) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  form,
  onFirstNameChange,
  onLastNameChange,
  initialValues,
  globalError,
  ...props
}) => {
  return (
    <Form.Form
      {...props}
      className={classNames("contact-form", props.className)}
      form={form}
      globalError={globalError}
      layout={"vertical"}
      initialValues={initialValues}
    >
      <Form.Item name={"type"} label={"Type"}>
        <Select suffixIcon={<FontAwesomeIcon icon={faCaretDown} />} placeholder={"Select Type"}>
          {model.models.ContactTypes.map((m: Model.ContactType, index: number) => (
            <Select.Option key={index} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={"first_name"} label={"First Name"}>
        <Input onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFirstNameChange(e.target.value)} />
      </Form.Item>
      <Form.Item name={"last_name"} label={"Last Name"}>
        <Input onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLastNameChange(e.target.value)} />
      </Form.Item>
      <Form.Item name={"company"} label={"Company"}>
        <Input />
      </Form.Item>
      <Form.Item name={"position"} label={"Job Title"}>
        <Input />
      </Form.Item>
      <Form.Item name={"city"} label={"City"}>
        <Input />
      </Form.Item>
      <Form.Item name={"email"} label={"Email"}>
        <Input />
      </Form.Item>
      <Form.Item name={"phone_number"} label={"Phone Number"}>
        <PhoneNumberInput />
      </Form.Item>
      <Form.Item name={"rate"} label={"Rate"}>
        <Input />
      </Form.Item>
    </Form.Form>
  );
};

export default ContactForm;
