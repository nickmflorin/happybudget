import React from "react";
import classNames from "classnames";

import { model } from "lib";

import { Form, Icon } from "components";
import { Input, Select, InputOnFocus } from "components/fields";
import { Link } from "components/links";

const ContactForm: React.FC<FormProps<Http.ContactPayload>> = ({ form, initialValues, ...props }) => {
  return (
    <Form.Form
      {...props}
      className={classNames("contact-form", props.className)}
      form={form}
      layout={"vertical"}
      initialValues={initialValues}
    >
      <Form.ColumnItem name={"contact_type"} label={"Type"} columnType={"singleSelect"}>
        <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />} placeholder={"Select Type"}>
          {model.models.ContactTypes.map((m: Model.ContactType, index: number) => (
            <Select.Option key={index} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>
      </Form.ColumnItem>
      <Form.ColumnItem name={"first_name"} label={"First Name"} columnType={"text"}>
        <Input />
      </Form.ColumnItem>
      <Form.ColumnItem name={"last_name"} label={"Last Name"} columnType={"text"}>
        <Input />
      </Form.ColumnItem>
      <Form.ColumnItem name={"company"} label={"Company"} columnType={"text"}>
        <Input />
      </Form.ColumnItem>
      <Form.ColumnItem name={"position"} label={"Job Title"} columnType={"text"}>
        <Input />
      </Form.ColumnItem>
      <Form.ColumnItem name={"city"} label={"City"} columnType={"text"}>
        <Input />
      </Form.ColumnItem>
      <Form.ColumnItem name={"email"} label={"Email"} columnType={"email"}>
        <InputOnFocus renderBlurredContentOnNoValue={true}>
          {(value?: string) => <Link href={`mailto:${value}`}>{value}</Link>}
        </InputOnFocus>
      </Form.ColumnItem>
      <Form.ColumnItem name={"phone_number"} label={"Phone Number"} columnType={"phone"}>
        <InputOnFocus renderBlurredContentOnNoValue={true}>
          {(value: string) => <Link href={`tel:${value}`}>{value}</Link>}
        </InputOnFocus>
      </Form.ColumnItem>
      <Form.ColumnItem name={"rate"} label={"Rate"} columnType={"currency"}>
        <Input />
      </Form.ColumnItem>
    </Form.Form>
  );
};

export default ContactForm;
