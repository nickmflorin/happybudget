import { useState } from "react";
import { isNil } from "lodash";

import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { Form } from "components";
import { PrimaryButton, DangerButton } from "components/buttons";
import { PublicUrlInput, DatePicker } from "components/fields";

export type EditPublicTokenFormValues = {
  readonly expires_at?: string | null;
};

export type EditPublicTokenFormProps = FormProps<EditPublicTokenFormValues> & {
  readonly onDelete: () => void;
  readonly disabled?: boolean;
  readonly urlFormatter: (tokenId: string) => string;
};

const EditPublicTokenForm = ({ onDelete, urlFormatter, disabled, ...props }: EditPublicTokenFormProps) => {
  const [autoExpire, setAutoExpire] = useState(!isNil(props.initialValues?.expires_at));

  return (
    <Form.Form
      layout={"vertical"}
      {...props}
      onFinish={(values: EditPublicTokenFormValues) => {
        let formatted: EditPublicTokenFormValues = {};
        if (autoExpire === true && values.expires_at !== undefined) {
          formatted = { ...formatted, expires_at: values.expires_at };
        }
        props.onFinish?.(formatted);
      }}
    >
      <Form.Item name={"public_id"} label={"Public URL"}>
        <PublicUrlInput allowRefresh={false} urlFormatter={urlFormatter} />
      </Form.Item>
      <Form.Item label={"Auto Expire"} horizontalLayoutOverride={true}>
        <Checkbox
          defaultChecked={!isNil(props.initialValues?.expires_at)}
          checked={autoExpire}
          onChange={(e: CheckboxChangeEvent) => setAutoExpire(e.target.checked)}
        />
      </Form.Item>
      <Form.Item name={"expires_at"} horizontalLayoutOverride={true}>
        <DatePicker disabled={!autoExpire} dateFormat={"dd/MM/yyyy"} />
      </Form.Item>
      <Form.Footer>
        <PrimaryButton
          size={"small"}
          disabled={disabled}
          htmlType={"submit"}
          style={{ width: "100%", marginBottom: 8 }}
        >
          {"Save"}
        </PrimaryButton>
        <DangerButton size={"small"} disabled={disabled} onClick={() => onDelete()} style={{ width: "100%" }}>
          {"Unshare"}
        </DangerButton>
      </Form.Footer>
    </Form.Form>
  );
};

export default EditPublicTokenForm;
