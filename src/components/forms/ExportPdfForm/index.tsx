import React, { useState, useMemo, useRef, forwardRef, ForwardedRef, useImperativeHandle } from "react";
import classNames from "classnames";
import { map, isNil, find } from "lodash";

import { Select, Switch, Tag, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons";

import * as api from "api";
import { hooks, model, util, tabling, ui } from "lib";

import { Icon, Form, ShowHide, Separator } from "components";
import { UploadPdfImage } from "components/uploaders";
import { EntityText } from "components/typography";
import { Editor } from "components/richtext";
import { EntityTextDescription } from "components/typography/EntityText";
import { FormProps } from "components/forms/Form";

import HeaderTemplateSaveForm, { IHeaderTemplateSaveFormRef } from "./HeaderTemplateSaveForm";
import useHeaderTemplate from "./useHeaderTemplate";
import HeaderTemplateSelect from "./HeaderTemplateSelect";

import "./index.scss";

// Does not seem to be exportable from AntD/RCSelect so we just copy it here.
type CustomTagProps = {
  label: React.ReactNode;
  value: any;
  disabled: boolean;
  onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  closable: boolean;
};

type Column = PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>;
type NonFormFields = "includeNotes" | "notes" | "header";
type RichTextFields = "notes" | "header";

export type IExportFormRef = {
  readonly getFormData: () => PdfBudgetTable.Options;
};

interface ExportFormProps extends FormProps<PdfBudgetTable.Options> {
  readonly disabled?: boolean;
  readonly columns: Column[];
  readonly accounts: Model.PdfAccount[];
  readonly accountsLoading?: boolean;
  readonly displayedHeaderTemplate: Model.HeaderTemplate | null;
  readonly headerTemplates: Model.HeaderTemplate[];
  readonly headerTemplatesLoading: boolean;
  readonly onClearHeaderTemplate: () => void;
  readonly onLoadHeaderTemplate: (id: number) => void;
  readonly onHeaderTemplateDeleted: (id: number) => void;
  readonly onHeaderTemplateCreated: (template: Model.HeaderTemplate) => void;
  readonly onHeaderTemplateUpdated?: (template: Model.HeaderTemplate) => void;
}

const ExportForm = (
  {
    accountsLoading,
    accounts,
    disabled,
    columns,
    displayedHeaderTemplate,
    headerTemplates,
    headerTemplatesLoading,
    onHeaderTemplateCreated,
    onClearHeaderTemplate,
    onLoadHeaderTemplate,
    onHeaderTemplateUpdated,
    onHeaderTemplateDeleted,
    ...props
  }: ExportFormProps,
  ref: ForwardedRef<IExportFormRef>
): JSX.Element => {
  const saveFormRef = useRef<IHeaderTemplateSaveFormRef>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showAllTables, setShowAllTables] = useState(isNil(props.initialValues?.tables));
  const [includeNotes, setIncludeNotes] = useState(false);
  const [notesBlocks, setNotesBlocks] = useState<RichText.Block[]>(props.initialValues?.notes || []);

  const _formDataWithoutHeader = useMemo(() => {
    return (values: Omit<PdfBudgetTable.Options, NonFormFields>): Omit<PdfBudgetTable.Options, "header"> => {
      let options: Partial<PdfBudgetTable.Options> = {
        ...values,
        includeNotes
      };
      if (includeNotes === true) {
        options = { ...options, notes: notesBlocks };
      }
      return options as PdfBudgetTable.Options;
    };
  }, [notesBlocks, includeNotes]);

  const [headerTemplateData, setHeaderTemplateData] = useHeaderTemplate({
    initialValues: props.initialValues?.header,
    template: displayedHeaderTemplate,
    onValuesChange: (changedValues: Partial<HeaderTemplateFormData>, values: HeaderTemplateFormData) => {
      const formValues: PdfBudgetTable.Options = props.form.getFieldsValue();
      // We need to use `_formDataWithoutHeader` to avoid recursion.
      props.onValuesChange?.({ header: changedValues }, { ..._formDataWithoutHeader(formValues), header: values });
    }
  });

  const formData = useMemo(() => {
    return (values: Omit<PdfBudgetTable.Options, NonFormFields>): PdfBudgetTable.Options => {
      return { ..._formDataWithoutHeader(values), header: headerTemplateData };
    };
  }, [notesBlocks, includeNotes, headerTemplateData]);

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const values: PdfBudgetTable.Options = props.form.getFieldsValue();
      return formData(values);
    }
  }));

  const rawFormInitialValues = useMemo<Omit<PdfBudgetTable.Options, RichTextFields> | undefined>(():
    | Omit<PdfBudgetTable.Options, RichTextFields>
    | undefined => {
    if (!isNil(props.initialValues)) {
      const { header, notes, ...rest } = props.initialValues as PdfBudgetTable.Options;
      return rest;
    }
    return undefined;
  }, [props.initialValues]);

  // TODO: Since we are doing this outside of Redux, which is necessary, we need to debounce
  // this in some manner.
  const createHeaderTemplate = hooks.useDynamicCallback((name: string) => {
    let requestPayload: Partial<Http.HeaderTemplatePayload> = {
      header: headerTemplateData.header,
      left_info: headerTemplateData.left_info,
      right_info: headerTemplateData.right_info,
      name
    };

    const submit = (values: Http.HeaderTemplatePayload) => {
      api
        .createHeaderTemplate(values)
        .then((response: Model.HeaderTemplate) => {
          onHeaderTemplateCreated(response);
          if (!isNil(saveFormRef.current)) {
            saveFormRef.current.setRequestNameInput(false);
          }
        })
        .catch((e: Error) => {
          props.form.handleRequestError(e);
          // Since the save form is not actually a Form, we have to manually set
          // the error.  There is only 1 field, `name`, so we want to manually set
          // field errors for that field attribute.  If the error does not pertain
          // to that field attribute, we will let the global form error handler
          // take effect.
          let manuallySetFieldError = false;
          if (e instanceof api.ClientError && !isNil(saveFormRef.current)) {
            const global = api.parseGlobalError(e);
            if (isNil(global)) {
              // There is a small chance there are multiple errors for the `name` field,
              // but we can only display 1.
              const parsed = api.parseFieldErrors(e);
              const nameError: Http.FieldError | undefined = find(parsed, { field: "name" });
              if (!isNil(nameError)) {
                manuallySetFieldError = true;
                if (nameError.code === "unique") {
                  saveFormRef.current.setError("The template name must be unique.");
                } else {
                  saveFormRef.current.setError(nameError.message);
                }
              }
            }
            if (!manuallySetFieldError) {
              props.form.handleRequestError(e);
            }
          }
        })
        .finally(() => {
          setSaving(false);
        });
    };

    setSaving(true);

    /*
    In the case of Save As, we are still creating the header template.  However,
    the image may not have been changed, in which case it will still be a SavedImage.
    In that case, we need to get the base64 representation.
    */
    const urlImages: { [key: string]: false | string } = { left_image: false, right_image: false };
    if (!isNil(headerTemplateData.left_image)) {
      if (!model.typeguards.isUploadedImage(headerTemplateData.left_image)) {
        urlImages.left_image = headerTemplateData.left_image.url;
      } else {
        requestPayload = { ...requestPayload, left_image: headerTemplateData.left_image.data };
      }
    }
    if (!isNil(headerTemplateData.right_image)) {
      if (!model.typeguards.isUploadedImage(headerTemplateData.right_image)) {
        urlImages.right_image = headerTemplateData.right_image.url;
      } else {
        requestPayload = { ...requestPayload, left_image: headerTemplateData.right_image.data };
      }
    }
    // The Promise structure of getting a base64 string from a URL complicates the logic flow
    // here quite a bit.
    if (urlImages.left_image === false && urlImages.right_image === false) {
      submit(requestPayload as Http.HeaderTemplatePayload);
    } else if (urlImages.left_image !== false && urlImages.right_image === false) {
      util.files
        .getBase64FromUrl(urlImages.left_image)
        .then((result: string | ArrayBuffer) => {
          submit({ ...requestPayload, left_image: result } as Http.HeaderTemplatePayload);
        })
        .catch((e: Error) => {
          /* eslint-disable no-console */
          console.error("Error converting left image to base64 representation from URL.  It will not be saved.");
          console.error(e);
          // Still submit request without the image included, we don't want the app to break
          // and we still want to save the template.
          submit(requestPayload as Http.HeaderTemplatePayload);
        });
    } else if (urlImages.left_image === false && urlImages.right_image !== false) {
      util.files
        .getBase64FromUrl(urlImages.right_image)
        .then((result: string | ArrayBuffer) => {
          submit({ ...requestPayload, right_image: result } as Http.HeaderTemplatePayload);
        })
        .catch((e: Error) => {
          /* eslint-disable no-console */
          console.error("Error converting right image to base64 representation from URL.  It will not be saved.");
          console.error(e);
          // Still submit request without the image included, we don't want the app to break
          // and we still want to save the template.
          submit(requestPayload as Http.HeaderTemplatePayload);
        });
    } else {
      const promises: [Promise<ArrayBuffer | string>, Promise<ArrayBuffer | string>] = [
        util.files.getBase64FromUrl(urlImages.left_image as string),
        util.files.getBase64FromUrl(urlImages.right_image as string)
      ];
      Promise.all(promises)
        .then((result: [ArrayBuffer | string, ArrayBuffer | string]) => {
          submit({ ...requestPayload, right_image: result[1], left_image: result[0] } as Http.HeaderTemplatePayload);
        })
        .catch((e: Error) => {
          /* eslint-disable no-console */
          console.error(
            "Error converting both right and left images to base64 representation from URL.  It will not be saved."
          );
          console.error(e);
          // Still submit request without the image included, we don't want the app to break
          // and we still want to save the template.
          submit(requestPayload as Http.HeaderTemplatePayload);
        });
    }
  });

  // TODO: Since we are doing this outside of Redux, which is necessary, we need to debounce
  // this in some manner.
  const updateHeaderTemplate = hooks.useDynamicCallback(() => {
    if (!isNil(displayedHeaderTemplate)) {
      let requestPayload: Partial<Http.HeaderTemplatePayload> = {
        header: headerTemplateData.header,
        left_info: headerTemplateData.left_info,
        right_info: headerTemplateData.right_info
      };
      // We only want to include the images in the payload if they were changed - this means they
      // are either null or of the UploadedImage form.
      if (!isNil(headerTemplateData.left_image) && model.typeguards.isUploadedImage(headerTemplateData.left_image)) {
        requestPayload = { ...requestPayload, left_image: headerTemplateData.left_image.data };
      } else if (isNil(headerTemplateData.left_image)) {
        requestPayload = { ...requestPayload, left_image: null };
      }
      if (!isNil(headerTemplateData.right_image) && model.typeguards.isUploadedImage(headerTemplateData.right_image)) {
        requestPayload = { ...requestPayload, right_image: headerTemplateData.right_image.data };
      } else if (isNil(headerTemplateData.right_image)) {
        requestPayload = { ...requestPayload, right_image: null };
      }
      setSaving(true);
      api
        .updateHeaderTemplate(displayedHeaderTemplate.id, requestPayload)
        .then((response: Model.HeaderTemplate) => {
          onHeaderTemplateUpdated?.(response);
          if (!isNil(saveFormRef.current)) {
            saveFormRef.current.setRequestNameInput(false);
          }
        })
        .catch((e: Error) => {
          props.form.handleRequestError(e);
        })
        .finally(() => {
          setSaving(false);
        });
    }
  });

  return (
    <Form.Form
      {...props}
      autoFocusField={false}
      initialValues={rawFormInitialValues}
      className={classNames("export-form", "condensed", props.className)}
      onFinish={(values: Omit<PdfBudgetTable.Options, NonFormFields>) => {
        props.onFinish?.(formData(values));
      }}
      onValuesChange={(
        changedValues: Partial<Omit<PdfBudgetTable.Options, NonFormFields>>,
        values: Omit<PdfBudgetTable.Options, NonFormFields>
      ) => {
        // Note: Since the images are not included as a part of the underlying Form mechanics,
        // they will not trigger this hook.  This means that we have to manually call the
        // onValuesChange() hook when the images change.
        props.onValuesChange?.(changedValues, formData(values));
      }}
    >
      <Form.ItemSection label={"Header"}>
        <Form.ItemStyle label={"Template"}>
          <HeaderTemplateSelect
            loading={headerTemplatesLoading}
            onLoad={onLoadHeaderTemplate}
            onClear={onClearHeaderTemplate}
            value={displayedHeaderTemplate}
            templates={headerTemplates}
            deleting={deleting}
            onDelete={(id: number) => {
              setDeleting(id);
              api
                .deleteHeaderTemplate(id)
                .then(() => onHeaderTemplateDeleted(id))
                .catch((e: Error) => props.form.handleRequestError(e))
                .finally(() => setDeleting(null));
            }}
          />
        </Form.ItemStyle>

        <Form.ItemStyle label={"Title"}>
          <Editor
            value={headerTemplateData.header}
            onChange={(blocks?: RichText.Block[]) => setHeaderTemplateData({ header: blocks })}
          />
        </Form.ItemStyle>

        <div className={"export-header-sides"}>
          <Form.ItemStyle label={"Left Side"} className={"export-header-side-item"}>
            <UploadPdfImage
              value={!isNil(displayedHeaderTemplate) ? displayedHeaderTemplate.left_image : null}
              onChange={(left_image: UploadedImage | null) => {
                // Images are not included in traditional form and thus do not trigger the
                // onValuesChange() callback - so we have to do it manually here.
                setHeaderTemplateData({ left_image });
              }}
              onError={(error: Error | string) => props.form.setGlobalError(error)}
            />
            <Editor
              value={headerTemplateData.left_info}
              onChange={(blocks?: RichText.Block[]) => setHeaderTemplateData({ left_info: blocks })}
            />
          </Form.ItemStyle>

          <Form.ItemStyle className={"export-header-side-item"} label={"Right Side"}>
            <UploadPdfImage
              onChange={(right_image: UploadedImage | null) => {
                // Images are not included in traditional form and thus do not trigger the
                // onValuesChange() callback - so we have to do it manually here.
                setHeaderTemplateData({ right_image });
              }}
              onError={(error: Error | string) => props.form.setGlobalError(error)}
            />
            <Editor
              value={headerTemplateData.right_info}
              onChange={(blocks?: RichText.Block[]) => setHeaderTemplateData({ right_info: blocks })}
            />
          </Form.ItemStyle>
        </div>

        <HeaderTemplateSaveForm
          ref={saveFormRef}
          existing={!isNil(displayedHeaderTemplate)}
          saving={saving}
          onSave={(name?: string) => {
            if (isNil(displayedHeaderTemplate) && !isNil(name)) {
              createHeaderTemplate(name);
            } else if (!isNil(displayedHeaderTemplate)) {
              if (isNil(name)) {
                updateHeaderTemplate();
              } else {
                createHeaderTemplate(name);
              }
            }
          }}
          style={{ marginTop: 10 }}
        />
      </Form.ItemSection>

      <Separator style={{ margin: "2px auto" }} />

      <Form.ItemSection
        label={"Table Options"}
        labelClassName={"label label--section"}
        labelStyle={{ marginBottom: "5px !important" }}
      >
        <Form.Item label={"Columns"} name={"columns"}>
          <Select
            suffixIcon={<FontAwesomeIcon icon={faCaretDown} />}
            mode={"multiple"}
            showArrow
            tagRender={(params: CustomTagProps) => {
              const column = find(columns, { field: params.value });
              if (!isNil(column)) {
                const colType = find(tabling.models.ColumnTypes, { id: column.columnType });
                return (
                  <Tag className={"column-select-tag"} style={{ marginRight: 3 }} {...params}>
                    {!isNil(colType) && !isNil(colType.icon) && (
                      <div className={"icon-wrapper"}>
                        {ui.typeguards.iconIsJSX(colType.icon) ? colType.icon : <Icon icon={colType.icon} />}
                      </div>
                    )}
                    {column.headerName}
                  </Tag>
                );
              }
              return <></>;
            }}
          >
            {map(columns, (column: Column, index: number) => {
              const colType = find(tabling.models.ColumnTypes, { id: column.columnType });
              return (
                <Select.Option className={"column-select-option"} key={index + 1} value={column.field as string}>
                  {!isNil(colType) && !isNil(colType.icon) && (
                    <div className={"icon-wrapper"}>
                      {ui.typeguards.iconIsJSX(colType.icon) ? colType.icon : <Icon icon={colType.icon} />}
                    </div>
                  )}
                  {column.headerName}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.ItemStyle label={"Show All Tables"}>
          <Checkbox
            defaultChecked={isNil(rawFormInitialValues?.tables)}
            checked={showAllTables}
            onChange={(e: CheckboxChangeEvent) => {
              const values: PdfBudgetTable.Options = props.form.getFieldsValue();
              setShowAllTables(e.target.checked);
              if (e.target.checked === true) {
                props.form.setFields([{ name: "tables", value: undefined }]);
                props.onValuesChange?.({ tables: undefined }, { ...formData(values), tables: undefined });
              } else {
                props.form.setFields([{ name: "tables", value: [] }]);
                props.onValuesChange?.({ tables: [] }, { ...formData(values), tables: [] });
              }
            }}
          />
        </Form.ItemStyle>
        <Form.Item label={"Tables"} name={"tables"} style={{ marginBottom: 5 }}>
          <Select
            suffixIcon={<FontAwesomeIcon icon={faCaretDown} />}
            showArrow
            disabled={accountsLoading}
            loading={accountsLoading}
            mode={"multiple"}
            className={classNames({ disabled: showAllTables })}
          >
            <Select.Option key={0} value={"topsheet"}>
              <EntityTextDescription>{"Top Sheet"}</EntityTextDescription>
            </Select.Option>
            {map(accounts, (account: Model.PdfAccount, index: number) => {
              return (
                <Select.Option key={index + 1} value={account.id}>
                  <EntityText fillEmpty={"----"}>{account}</EntityText>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item valuePropName={"checked"} name={"excludeZeroTotals"} label={"Exclude Accounts Totalling Zero"}>
          <Switch
            checkedChildren={"ON"}
            unCheckedChildren={"OFF"}
            defaultChecked={rawFormInitialValues?.excludeZeroTotals === true}
          />
        </Form.Item>
      </Form.ItemSection>

      <Separator style={{ margin: "2px auto" }} />

      <Form.ItemSection label={"Notes"} labelClassName={"label--section"}>
        <Form.Item label={"Include Notes Section"}>
          <Switch
            checkedChildren={"ON"}
            unCheckedChildren={"OFF"}
            defaultChecked={false}
            onChange={(checked: boolean) => {
              const values: PdfBudgetTable.Options = props.form.getFieldsValue();
              props.onValuesChange?.({ includeNotes: checked }, { ...formData(values), includeNotes: checked });
              setIncludeNotes(checked);
            }}
          />
        </Form.Item>

        <ShowHide show={includeNotes}>
          <Form.ItemStyle>
            <Editor
              style={{ height: 140 }}
              value={props.initialValues?.notes}
              onChange={(blocks?: RichText.Block[]) => {
                blocks = !isNil(blocks) ? blocks : [];
                setNotesBlocks(blocks);
                const values: PdfBudgetTable.Options = props.form.getFieldsValue();
                props.onValuesChange?.({ notes: blocks }, { ...formData(values), notes: blocks });
              }}
            />
          </Form.ItemStyle>
        </ShowHide>
      </Form.ItemSection>
    </Form.Form>
  );
};

export default forwardRef(ExportForm);
