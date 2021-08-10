import { useState, useImperativeHandle, forwardRef, ForwardedRef } from "react";
import classNames from "classnames";

import { ShowHide, Form } from "components";
import { Button, ClearButton } from "components/buttons";
import { Input } from "components/fields";

import "./HeaderTemplateSaveForm.scss";
import { isNil } from "lodash";
import { useEffect } from "react";

export type IHeaderTemplateSaveFormRef = {
  readonly setRequestNameInput: (value: boolean) => void;
  readonly setError: (value: string | null) => void;
};

interface HeaderTemplateSaveFormProps extends StandardComponentProps {
  readonly disabled?: boolean;
  readonly existing: boolean;
  readonly saving: boolean;
  readonly onSave: (name?: string) => void;
}

const HeaderTemplateSaveForm = (
  { disabled, saving, existing, onSave, ...props }: HeaderTemplateSaveFormProps,
  ref: ForwardedRef<IHeaderTemplateSaveFormRef>
): JSX.Element => {
  const [error, setError] = useState<string | null>(null);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [requestNameInput, setRequestNameInput] = useState(false);
  const [name, setName] = useState<string>("");

  useImperativeHandle(ref, () => ({
    setRequestNameInput,
    setError
  }));

  useEffect(() => {
    if (requestNameInput === false) {
      setSaveAsMode(false);
    }
  }, [requestNameInput]);

  return (
    <div {...props} className={classNames("header-template-save-form", props.className)}>
      <div className={"form-item"}>
        <div style={{ display: "flex" }}>
          <Button
            className={"btn btn--primary btn--small"}
            disabled={disabled || saving}
            loading={saving}
            style={{ marginRight: !isNil(existing) || requestNameInput ? 6 : 0 }}
            onClick={() => {
              if (requestNameInput === true) {
                if (name.trim() !== "") {
                  setError(null);
                  onSave(name);
                } else {
                  setError("Template name is required.");
                }
              } else if (existing === false) {
                setError(null);
                setRequestNameInput(true);
              } else {
                setError(null);
                onSave();
              }
            }}
          >
            {"Save"}
          </Button>
          <ShowHide show={existing && saveAsMode === false}>
            <Button
              className={"btn btn--default btn--small"}
              style={{ marginRight: requestNameInput ? 6 : 0 }}
              disabled={disabled || saving || saveAsMode === true}
              onClick={() => {
                setRequestNameInput(true);
                setSaveAsMode(true);
              }}
            >
              {"Save As"}
            </Button>
          </ShowHide>
          <ShowHide show={requestNameInput}>
            <div style={{ display: "flex" }}>
              <Input
                placeholder={"Name"}
                className={classNames("input input--small", { "with-error": !isNil(error) })}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
              <ClearButton
                onClick={() => {
                  setError(null);
                  setRequestNameInput(false);
                }}
              />
            </div>
          </ShowHide>
        </div>
        <Form.FieldError>{error}</Form.FieldError>
      </div>
    </div>
  );
};

export default forwardRef(HeaderTemplateSaveForm);
