import { useState, useMemo, ForwardedRef, forwardRef, useImperativeHandle } from "react";

import { isNil } from "lodash";
import { Switch } from "antd";

import { Form, ShowHide } from "components";
import { ButtonDangerLink } from "components/buttons";
import { PublicUrlInput, DatePicker } from "components/fields";

export type EditPublicTokenFormValues = {
  readonly expires_at?: string | null;
};

export type EditPublicTokenFormProps = FormProps<EditPublicTokenFormValues> & {
  readonly onDelete: () => void;
  readonly disabled?: boolean;
  readonly urlFormatter: (tokenId: string) => string;
  readonly onChange?: (values: Partial<EditPublicTokenFormValues>) => void;
};

export type IEditPublicTokenFormRef = {
  readonly setAutoExpire: (v: boolean) => void;
};

const EditPublicTokenForm = forwardRef(
  (
    { onDelete, urlFormatter, disabled, ...props }: EditPublicTokenFormProps,
    ref: ForwardedRef<IEditPublicTokenFormRef>,
  ) => {
    const [autoExpire, _setAutoExpire] = useState(!isNil(props.initialValues?.expires_at));

    const setAutoExpire = useMemo(
      () => (value: boolean) => {
        _setAutoExpire(value);
        const expiresAt = props.form.getFieldValue("expires_at");
        /* If autoExpire is toggled to ON, then we only want to trigger the
         `onValuesChange` callback if there is an expiry date already set for
         the Form Field - otherwise, there is nothing to change until the expiry
         date is set on the Form Field. */
        if (value === true) {
          if (!isNil(expiresAt)) {
            props.onValuesChange?.({ expires_at: expiresAt }, { expires_at: expiresAt });
          }
          /* If autoExpire is toggled to OFF, then we only want to trigger the
						`onValuesChange` callback if there was previously an expiry date set
						for the Form Field - otherwise, the expiry date will already have been
						null. */
        } else {
          if (!isNil(expiresAt)) {
            props.onValuesChange?.({ expires_at: null }, { expires_at: null });
          }
        }
      },
      [props.onValuesChange],
    );

    useImperativeHandle(ref, () => ({ setAutoExpire }));

    return (
      <Form.Form
        layout="vertical"
        {...props}
        onFinish={(values: EditPublicTokenFormValues) => {
          let formatted: EditPublicTokenFormValues = {};
          if (autoExpire === true && values.expires_at !== undefined) {
            formatted = { ...formatted, expires_at: values.expires_at };
          }
          props.onFinish?.(formatted);
        }}
      >
        <Form.Item name="public_id">
          <PublicUrlInput urlFormatter={urlFormatter} actions={["copy", "visit"]} />
        </Form.Item>
        <Form.Item label="Auto Expire" horizontalLayoutOverride={true}>
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            defaultChecked={!isNil(props.initialValues?.expires_at)}
            checked={autoExpire}
            onChange={(checked: boolean) => setAutoExpire(checked)}
          />
        </Form.Item>
        <ShowHide show={autoExpire}>
          <Form.Item name="expires_at" horizontalLayoutOverride={true}>
            <DatePicker disabled={!autoExpire} dateFormat="dd/MM/yyyy" />
          </Form.Item>
        </ShowHide>
        <Form.Footer style={{ marginTop: 6 }}>
          <ButtonDangerLink
            size="small"
            disabled={disabled}
            onClick={() => onDelete()}
            style={{ width: "100%" }}
          >
            Stop Sharing
          </ButtonDangerLink>
        </Form.Footer>
      </Form.Form>
    );
  },
);

export default EditPublicTokenForm;
