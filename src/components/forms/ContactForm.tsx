import React from "react";
import classNames from "classnames";

import { model } from "lib";

import { Form, Icon } from "components";
import { Input, Select, InputOnFocus } from "components/fields";
import { EditAttachments, EditAttachmentsProps } from "components/files";
import { Link } from "components/links";
import { isNil } from "lodash";

interface ContactFormProps extends FormProps<Http.ContactPayload> {
  readonly attachmentsProps?: EditAttachmentsProps | undefined;
}

const ContactForm: React.FC<ContactFormProps> = ({ form, initialValues, attachmentsProps, ...props }) => {
  return (
    <Form.Form
      {...props}
      className={classNames("contact-form", props.className)}
      form={form}
      layout={"vertical"}
      initialValues={initialValues}
    >
      <Form.Item name={"contact_type"} label={"Type"} columnType={"singleSelect"}>
        <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />} placeholder={"Select Type"}>
          {model.models.ContactTypes.map((m: Model.ContactType, index: number) => (
            <Select.Option key={index} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={"first_name"} label={"First Name"} columnType={"text"}>
        <Input />
      </Form.Item>
      <Form.Item name={"last_name"} label={"Last Name"} columnType={"text"}>
        <Input />
      </Form.Item>
      <Form.Item name={"company"} label={"Company"} columnType={"text"}>
        <Input />
      </Form.Item>
      <Form.Item name={"position"} label={"Job Title"} columnType={"text"}>
        <Input />
      </Form.Item>
      <Form.Item name={"city"} label={"City"} columnType={"text"}>
        <Input />
      </Form.Item>
      <Form.Item name={"email"} label={"Email"} columnType={"email"}>
        <InputOnFocus renderBlurredContentOnNoValue={true}>
          {(value?: string) => <Link href={`mailto:${value}`}>{value}</Link>}
        </InputOnFocus>
      </Form.Item>
      <Form.Item name={"phone_number"} label={"Phone Number"} columnType={"phone"}>
        <InputOnFocus renderBlurredContentOnNoValue={true}>
          {(value: string) => <Link href={`tel:${value}`}>{value}</Link>}
        </InputOnFocus>
      </Form.Item>
      <Form.Item name={"rate"} label={"Rate"} columnType={"currency"}>
        <Input />
      </Form.Item>
      {!isNil(attachmentsProps) ? (
        <Form.ItemStyle label={"Attachments"} columnType={"file"}>
          <EditAttachments {...attachmentsProps} />
        </Form.ItemStyle>
      ) : (
        <></>
      )}
    </Form.Form>
  );
};

export default ContactForm;
