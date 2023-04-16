import { useState, useEffect, useImperativeHandle, forwardRef, ForwardedRef } from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { ShowHide, Form } from "components";
import { DefaultButton, ClearButton } from "components/buttonsOld";
import { Input, HeaderTemplateSelect } from "components/fields";

export type IHeaderTemplateSaveFormRef = {
  readonly setRequestNameInput: (value: boolean) => void;
  readonly setError: (value: string | null) => void;
};

interface HeaderTemplateSaveFormProps extends StandardComponentProps {
  readonly disabled?: boolean;
  readonly saving: boolean;
  readonly select: NonNullRef<HeaderTemplateSelectInstance>;
  readonly value: Model.HeaderTemplate | null;
  readonly onSave: (name?: string) => void;
  readonly onChange: (m: Model.HeaderTemplate | null) => void;
  readonly onDeleted: (id: number) => void;
}

const HeaderTemplateSaveForm = (
  {
    value,
    disabled,
    saving,
    select,
    onSave,
    onChange,
    onDeleted,
    ...props
  }: HeaderTemplateSaveFormProps,
  ref: ForwardedRef<IHeaderTemplateSaveFormRef>,
): JSX.Element => {
  const [error, setError] = useState<string | null>(null);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [requestNameInput, setRequestNameInput] = useState(false);
  const [name, setName] = useState<string>("");

  useImperativeHandle(ref, () => ({
    setRequestNameInput,
    setError,
  }));

  useEffect(() => {
    if (requestNameInput === false) {
      setSaveAsMode(false);
    }
  }, [requestNameInput]);

  return (
    <div {...props} className={classNames("header-template-save-form", props.className)}>
      <Form.Item label="Header Template">
        <div className="header-template-save-form-content">
          <HeaderTemplateSelect
            wrapperStyle={{ width: 200, marginRight: 6 }}
            value={isNil(value) ? value : value.id}
            onChange={onChange}
            select={select}
            onDeleted={onDeleted}
          />
          <DefaultButton
            disabled={disabled || saving}
            loading={saving}
            style={{ marginRight: !isNil(value) || requestNameInput ? 6 : 0, fontSize: "11px" }}
            onClick={() => {
              if (requestNameInput === true) {
                if (name.trim() !== "") {
                  setError(null);
                  onSave(name);
                } else {
                  setError("Template name is required.");
                }
              } else if (isNil(value)) {
                setError(null);
                setRequestNameInput(true);
              } else {
                setError(null);
                onSave();
              }
            }}
          >
            Save
          </DefaultButton>
          <ShowHide show={!isNil(value) && saveAsMode === false}>
            <DefaultButton
              style={{ marginRight: requestNameInput ? 6 : 0, fontSize: "11px" }}
              disabled={disabled || saving || saveAsMode === true}
              onClick={() => {
                setRequestNameInput(true);
                setSaveAsMode(true);
              }}
            >
              Save As...
            </DefaultButton>
          </ShowHide>
          <ShowHide show={requestNameInput}>
            <div style={{ display: "flex" }}>
              <Input
                placeholder="Name"
                className={classNames({ "with-error": !isNil(error) })}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
              <ClearButton
                size="small"
                iconSize="small"
                onClick={() => {
                  setError(null);
                  setRequestNameInput(false);
                }}
              />
            </div>
          </ShowHide>
        </div>
      </Form.Item>
      <Form.FieldError>{error}</Form.FieldError>
    </div>
  );
};

export default forwardRef(HeaderTemplateSaveForm);
