import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { Form, ShowHide } from "components";
import { PrimaryButton } from "components/buttons";
import { PublicUrlInput, DatePicker } from "components/fields";

export type CreatePublicTokenFormValues = {
  readonly public_id: string;
  readonly expires_at?: string | null;
};

export type CreatePublicTokenFormProps = Omit<FormProps<CreatePublicTokenFormValues>, "initialValues"> & {
  readonly urlFormatter: (tokenId: string) => string;
};

const CreatePublicTokenForm = ({ urlFormatter, ...props }: CreatePublicTokenFormProps) => {
  const [autoExpire, setAutoExpire] = useState(false);

  return (
    <Form.Form
      layout={"vertical"}
      initialValues={{ public_id: uuidv4() }}
      {...props}
      onFinish={(values: CreatePublicTokenFormValues) => {
        let formatted: CreatePublicTokenFormValues = { public_id: values.public_id };
        if (autoExpire === true && values.expires_at !== undefined) {
          formatted = { ...formatted, expires_at: values.expires_at };
        }
        props.onFinish?.(formatted);
      }}
    >
      <Form.Item name={"public_id"} label={"Public URL"}>
        <PublicUrlInput urlFormatter={urlFormatter} />
      </Form.Item>
      <Form.Item label={"Auto Expire"} horizontalLayoutOverride={true}>
        <Checkbox
          defaultChecked={false}
          checked={autoExpire}
          onChange={(e: CheckboxChangeEvent) => setAutoExpire(e.target.checked)}
        />
      </Form.Item>
      <ShowHide show={autoExpire}>
        <Form.Item name={"expires_at"}>
          <DatePicker disabled={!autoExpire} dateFormat={"dd/MM/yyyy"} />
        </Form.Item>
      </ShowHide>
      <Form.Footer>
        <PrimaryButton htmlType={"submit"} style={{ width: "100%" }}>
          {"Share"}
        </PrimaryButton>
      </Form.Footer>
    </Form.Form>
  );
};

export default CreatePublicTokenForm;
