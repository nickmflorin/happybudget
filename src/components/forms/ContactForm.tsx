import React from "react";
import classNames from "classnames";

import { model } from "lib";

import { Form, Icon } from "components";
import { Input, Select, InputOnFocus, TextArea } from "components/fields";
import { EditAttachments, EditAttachmentsProps } from "components/files";
import { Link } from "components/links";
import { isNil } from "lodash";

interface ContactFormProps extends FormProps<Http.ContactPayload> {
  readonly attachmentsProps?: EditAttachmentsProps | undefined;
}

const ContactForm: React.FC<ContactFormProps> = ({ form, initialValues, attachmentsProps, ...props }) => (
  <Form.Form
    {...props}
    className={classNames("contact-form", props.className)}
    form={form}
    layout={"vertical"}
    initialValues={initialValues}
  >
    <Form.Item name={"contact_type"} label={"Type"} dataType={"singleSelect"}>
      <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />} placeholder={"Select Type"}>
        {model.contact.ContactTypes.choices.map((m: Model.ContactType, index: number) => (
          <Select.Option key={index} value={m.id}>
            {m.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item name={"first_name"} label={"First Name"} dataType={"text"}>
      <Input />
    </Form.Item>
    <Form.Item name={"last_name"} label={"Last Name"} dataType={"text"}>
      <Input />
    </Form.Item>
    <Form.Item name={"company"} label={"Company"} dataType={"text"}>
      <Input />
    </Form.Item>
    <Form.Item name={"position"} label={"Job Title"} dataType={"text"}>
      <Input />
    </Form.Item>
    <Form.Item name={"city"} label={"City"} dataType={"text"}>
      <Input />
    </Form.Item>
    <Form.Item name={"email"} label={"Email"} dataType={"email"}>
      <InputOnFocus renderBlurredContentOnNoValue={true}>
        {(value?: string) => <Link href={`mailto:${value}`}>{value}</Link>}
      </InputOnFocus>
    </Form.Item>
    <Form.Item name={"phone_number"} label={"Phone Number"} dataType={"phone"}>
      <InputOnFocus renderBlurredContentOnNoValue={true}>
        {(value: string) => <Link href={`tel:${value}`}>{value}</Link>}
      </InputOnFocus>
    </Form.Item>
    <Form.Item name={"rate"} label={"Rate"} dataType={"currency"}>
      <Input />
    </Form.Item>
    <Form.Item name={"notes"} label={"Notes"} dataType={"longText"}>
      <TextArea />
    </Form.Item>
    {!isNil(attachmentsProps) ? (
      <Form.Item label={"Attachments"} dataType={"file"}>
        <EditAttachments {...attachmentsProps} />
      </Form.Item>
    ) : (
      <></>
    )}
  </Form.Form>
);

export default ContactForm;
