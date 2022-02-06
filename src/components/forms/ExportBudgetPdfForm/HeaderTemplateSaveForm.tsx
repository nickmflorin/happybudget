import { useState, useEffect, useImperativeHandle, forwardRef, ForwardedRef } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import * as api from "api";

import { ShowHide, Form } from "components";
import { DefaultButton, ClearButton } from "components/buttons";
import { Input } from "components/fields";

import HeaderTemplateSelect from "./HeaderTemplateSelect";
import "./HeaderTemplateSaveForm.scss";

export type IHeaderTemplateSaveFormRef = {
  readonly setRequestNameInput: (value: boolean) => void;
  readonly setError: (value: string | null) => void;
};

interface HeaderTemplateSaveFormProps extends StandardComponentProps {
  readonly disabled?: boolean;
  readonly existing: boolean;
  readonly saving: boolean;
  readonly onSave: (name?: string) => void;
  readonly loading: boolean;
  readonly onLoad: (id: number) => void;
  readonly onClear: () => void;
  readonly value: Model.HeaderTemplate | null;
  readonly templates: Model.HeaderTemplate[];
  readonly onHeaderTemplateDeleted: (id: number) => void;
}

const HeaderTemplateSaveForm = (
  {
    disabled,
    saving,
    existing,
    onSave,
    loading,
    onLoad,
    onClear,
    value,
    templates,
    onHeaderTemplateDeleted,
    ...props
  }: HeaderTemplateSaveFormProps,
  ref: ForwardedRef<IHeaderTemplateSaveFormRef>
): JSX.Element => {
  const [error, setError] = useState<string | null>(null);
  const [saveAsMode, setSaveAsMode] = useState(false);
  const [requestNameInput, setRequestNameInput] = useState(false);
  const [name, setName] = useState<string>("");
  const [deleting, setDeleting] = useState<number | null>(null);

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
      <Form.Item label={"Header Template"}>
        <div className={"header-template-save-form-content"}>
          <HeaderTemplateSelect
            loading={loading}
            onLoad={onLoad}
            onClear={onClear}
            value={value}
            templates={templates}
            deleting={deleting}
            onDelete={(id: number) => {
              setDeleting(id);
              api
                .deleteHeaderTemplate(id)
                .then(() => onHeaderTemplateDeleted(id))
                // .catch((e: Error) => props.form.handleRequestError(e))
                .catch(() => setError("An error occurred while deleting the header template."))
                .finally(() => setDeleting(null));
            }}
          />
          <DefaultButton
            disabled={disabled || saving}
            size={"small"}
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
          </DefaultButton>

          <ShowHide show={existing && saveAsMode === false}>
            <DefaultButton
              size={"small"}
              style={{ marginRight: requestNameInput ? 6 : 0 }}
              disabled={disabled || saving || saveAsMode === true}
              onClick={() => {
                setRequestNameInput(true);
                setSaveAsMode(true);
              }}
            >
              {"Save As..."}
            </DefaultButton>
          </ShowHide>

          <ShowHide show={requestNameInput}>
            <div style={{ display: "flex" }}>
              <Input
                placeholder={"Name"}
                small={true}
                className={classNames({ "with-error": !isNil(error) })}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
              <ClearButton
                size={"small"}
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
