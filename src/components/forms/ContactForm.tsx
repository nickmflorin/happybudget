import React from "react";
import classNames from "classnames";

import { model } from "lib";

import { Form, Icon } from "components";
import { Input, Select } from "components/fields";
import { PhoneNumberInput } from "../fields";
import "./ContactForm.scss";

const ContactForm: React.FC<FormProps<Http.ContactPayload>> = ({ form, initialValues, globalError, ...props }) => {
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
        <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />} placeholder={"Select Type"}>
          {model.models.ContactTypes.map((m: Model.ContactType, index: number) => (
            <Select.Option key={index} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={"first_name"} label={"First Name"}>
        <Input />
      </Form.Item>
      <Form.Item name={"last_name"} label={"Last Name"}>
        <Input />
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
