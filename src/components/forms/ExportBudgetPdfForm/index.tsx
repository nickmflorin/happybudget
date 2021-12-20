import { useState, useMemo, useRef, forwardRef, ForwardedRef, useImperativeHandle, useEffect } from "react";
import classNames from "classnames";
import { map, isNil, find, filter, debounce } from "lodash";

import { Select, Switch, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import * as api from "api";
import { typeguards } from "lib";

import { Icon, Form, ShowHide, Separator } from "components";
import { ColumnSelect } from "components/fields";
import { UploadPdfImage } from "components/uploaders";
import { EntityText } from "components/typography";
import { CKEditor } from "components/richtext";
import { EntityTextDescription } from "components/typography/EntityText";

import HeaderTemplateSaveForm, { IHeaderTemplateSaveFormRef } from "./HeaderTemplateSaveForm";

import "./index.scss";

type NonFormFields = "includeNotes" | "notes" | "header";
type RichTextFields = "notes" | "header";

type R = Tables.SubAccountRowData;
type M = Model.PdfSubAccount;
type C = Table.Column<R, M>;

interface ExportFormProps extends FormProps<ExportBudgetPdfFormOptions> {
  readonly columns: C[];
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
  ref: ForwardedRef<IExportFormRef<ExportBudgetPdfFormOptions>>
): JSX.Element => {
  const leftInfoEditor = useRef<IEditor>(null);
  const rightInfoEditor = useRef<IEditor>(null);
  const headerEditor = useRef<IEditor>(null);

  const saveFormRef = useRef<IHeaderTemplateSaveFormRef>(null);
  const [saving, setSaving] = useState(false);
  const [showAllTables, setShowAllTables] = useState(isNil(props.initialValues?.tables));
  const [includeNotes, setIncludeNotes] = useState(false);
  const [notesHtml, setNotesHtml] = useState<string | null>(props.initialValues?.notes || null);
  const [leftImage, _setLeftImage] = useState<UploadedImage | SavedImage | null>(
    displayedHeaderTemplate?.left_image || null
  );
  const [rightImage, _setRightImage] = useState<UploadedImage | SavedImage | null>(
    displayedHeaderTemplate?.right_image || null
  );

  const _formDataWithoutHeader = useMemo(() => {
    return (values: Omit<ExportBudgetPdfFormOptions, NonFormFields>): Omit<ExportBudgetPdfFormOptions, "header"> => {
      let options: Partial<ExportBudgetPdfFormOptions> = {
        ...values,
        includeNotes
      };
      if (includeNotes === true) {
        options = { ...options, notes: notesHtml };
      }
      return options as ExportBudgetPdfFormOptions;
    };
  }, [notesHtml, includeNotes]);

  const getHeaderTemplateData = useMemo<() => HeaderTemplateFormData>(
    () => (): HeaderTemplateFormData => {
      return {
        header: headerEditor.current?.getData() || null,
        left_info: leftInfoEditor.current?.getData() || null,
        right_info: rightInfoEditor.current?.getData() || null,
        right_image: rightImage,
        left_image: leftImage
      };
    },
    [headerEditor.current, leftInfoEditor.current, rightInfoEditor.current, leftImage, rightImage]
  );

  const formData = useMemo(() => {
    return (values: Omit<ExportBudgetPdfFormOptions, NonFormFields>): ExportBudgetPdfFormOptions => {
      return { ..._formDataWithoutHeader(values), header: getHeaderTemplateData() };
    };
  }, [_formDataWithoutHeader, getHeaderTemplateData]);

  useEffect(() => {
    if (!isNil(displayedHeaderTemplate)) {
      headerEditor.current?.setData(displayedHeaderTemplate.header || "");
      leftInfoEditor.current?.setData(displayedHeaderTemplate.left_info || "");
      rightInfoEditor.current?.setData(displayedHeaderTemplate.right_info || "");

      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      _setRightImage(displayedHeaderTemplate.right_image);
      _setLeftImage(displayedHeaderTemplate.left_image);
      props.onValuesChange?.(
        { header: displayedHeaderTemplate },
        { ..._formDataWithoutHeader(values), header: displayedHeaderTemplate }
      );
    } else {
      headerEditor.current?.setData(props.initialValues?.header?.header || "");
      leftInfoEditor.current?.setData(props.initialValues?.header?.left_info || "");
      rightInfoEditor.current?.setData(props.initialValues?.header?.right_info || "");
      _setLeftImage(props.initialValues?.header?.left_image || null);
      _setRightImage(props.initialValues?.header?.right_image || null);
    }
  }, [displayedHeaderTemplate]);

  const setLeftImage = useMemo(
    () => (img: UploadedImage | SavedImage | null) => {
      _setLeftImage(img);
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      props.onValuesChange?.(
        { header: { ...getHeaderTemplateData(), left_image: img } },
        { ..._formDataWithoutHeader(values), header: { ...getHeaderTemplateData(), left_image: img } }
      );
    },
    [_formDataWithoutHeader, getHeaderTemplateData]
  );

  const setRightImage = useMemo(
    () => (img: UploadedImage | SavedImage | null) => {
      _setRightImage(img);
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      props.onValuesChange?.(
        { header: { ...getHeaderTemplateData(), right_image: img } },
        { ..._formDataWithoutHeader(values), header: { ...getHeaderTemplateData(), right_image: img } }
      );
    },
    [_formDataWithoutHeader, getHeaderTemplateData]
  );

  const setHeader = useMemo(
    () => (html: string) => {
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      props.onValuesChange?.(
        { header: { ...getHeaderTemplateData(), header: html } },
        { ..._formDataWithoutHeader(values), header: { ...getHeaderTemplateData(), header: html } }
      );
    },
    [_formDataWithoutHeader, getHeaderTemplateData]
  );

  const setLeftInfo = useMemo(
    () => (html: string) => {
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      props.onValuesChange?.(
        { header: { ...getHeaderTemplateData(), left_info: html } },
        { ..._formDataWithoutHeader(values), header: { ...getHeaderTemplateData(), left_info: html } }
      );
    },
    [_formDataWithoutHeader, getHeaderTemplateData]
  );

  const setRightInfo = useMemo(
    () => (html: string) => {
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      props.onValuesChange?.(
        { header: { ...getHeaderTemplateData(), right_info: html } },
        { ..._formDataWithoutHeader(values), header: { ...getHeaderTemplateData(), right_info: html } }
      );
    },
    [_formDataWithoutHeader, getHeaderTemplateData]
  );

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      return formData(values);
    }
  }));

  const rawFormInitialValues = useMemo<Omit<ExportBudgetPdfFormOptions, RichTextFields> | undefined>(():
    | Omit<ExportBudgetPdfFormOptions, RichTextFields>
    | undefined => {
    if (!isNil(props.initialValues)) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { header, notes, ...rest } = props.initialValues as ExportBudgetPdfFormOptions;
      return rest;
    }
    return undefined;
  }, [props.initialValues]);

  const createTemplate = useMemo(
    () => (name: string, original?: Model.HeaderTemplate) => {
      const data: HeaderTemplateFormData = getHeaderTemplateData();
      let requestPayload: Http.HeaderTemplatePayload = {
        left_info: data.left_info,
        header: data.header,
        right_info: data.right_info,
        name
      };
      if (!isNil(data.left_image) && typeguards.isUploadedImage(data.left_image)) {
        requestPayload = { ...requestPayload, left_image: data.left_image.data };
      }
      if (!isNil(data.right_image) && typeguards.isUploadedImage(data.right_image)) {
        requestPayload = { ...requestPayload, right_image: data.right_image.data };
      }
      if (!isNil(original)) {
        requestPayload = { ...requestPayload, original: original.id };
      }
      setSaving(true);
      api
        .createHeaderTemplate(requestPayload)
        .then((response: Model.HeaderTemplate) => {
          onHeaderTemplateCreated(response);
          if (!isNil(saveFormRef.current)) {
            saveFormRef.current.setRequestNameInput(false);
          }
        })
        .catch((e: Error) => {
          props.form.handleRequestError(e);
          /* Since the save form is not actually a Form, we have to manually set
             the error.  There is only 1 field, `name`, so we want to manually set
             field errors for that field attribute.  If the error does not pertain
             to that field attribute, we will let the global form error handler
             take effect. */
          let manuallySetFieldError = false;
          if (e instanceof api.ClientError && !isNil(saveFormRef.current)) {
            if (e.fieldErrors.length !== 0) {
              /* There is a small chance there are multiple errors for the
								 `name` field, but we can only display 1. */
              const nameError: Http.FieldError | undefined = find(e.fieldErrors, { field: "name" });
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
    },
    [getHeaderTemplateData]
  );

  const updateTemplate = useMemo(
    () => (template: Model.HeaderTemplate) => {
      const data: HeaderTemplateFormData = getHeaderTemplateData();
      let requestPayload: Http.HeaderTemplatePayload = {
        left_info: data.left_info,
        header: data.header,
        right_info: data.right_info
      };
      /* We only want to include the images in the payload if they were changed
				 - this means they are either null or of the UploadedImage form. */
      if (!isNil(data.left_image) && typeguards.isUploadedImage(data.left_image)) {
        requestPayload = { ...requestPayload, left_image: data.left_image.data };
      } else if (isNil(data.left_image)) {
        requestPayload = { ...requestPayload, left_image: null };
      }
      if (!isNil(data.right_image) && typeguards.isUploadedImage(data.right_image)) {
        requestPayload = { ...requestPayload, right_image: data.right_image.data };
      } else if (isNil(data.right_image)) {
        requestPayload = { ...requestPayload, right_image: null };
      }
      setSaving(true);
      api
        .updateHeaderTemplate(template.id, requestPayload)
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
    },
    [getHeaderTemplateData]
  );

  const onSave = useMemo(
    () => (name?: string) => {
      if (isNil(displayedHeaderTemplate) && !isNil(name)) {
        createTemplate(name);
      } else if (!isNil(displayedHeaderTemplate)) {
        if (isNil(name)) {
          updateTemplate(displayedHeaderTemplate);
        } else {
          createTemplate(name, displayedHeaderTemplate);
        }
      }
    },
    [createTemplate, updateTemplate, displayedHeaderTemplate]
  );

  const debouncedSave = useMemo(() => debounce(onSave, 400), [onSave]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, []);

  return (
    <Form.Form
      {...props}
      autoFocusField={false}
      initialValues={rawFormInitialValues}
      condensed={true}
      className={classNames("export-form", props.className)}
      onFinish={(values: Omit<ExportBudgetPdfFormOptions, NonFormFields>) => {
        props.onFinish?.(formData(values));
      }}
      onValuesChange={(
        changedValues: Partial<Omit<ExportBudgetPdfFormOptions, NonFormFields>>,
        values: Omit<ExportBudgetPdfFormOptions, NonFormFields>
      ) => {
        /* Note: Since the images are not included as a part of the underlying
					 Form mechanics, they will not trigger this hook.  This means that we
					 have to manually call the onValuesChange() hook when the images
					 change. */
        props.onValuesChange?.(changedValues, formData(values));
      }}
      layout={"vertical"}
    >
      <Form.ItemSection label={"Header"}>
        <Form.ItemStyle label={"Title"}>
          <CKEditor
            ref={headerEditor}
            initialValue={props.initialValues?.header?.header || ""}
            onChange={(html: string) => setHeader(html)}
          />
        </Form.ItemStyle>

        <div className={"export-header-sides"}>
          <Form.ItemStyle label={"Left Side"} className={"export-header-side-item"}>
            <UploadPdfImage
              value={!isNil(displayedHeaderTemplate) ? displayedHeaderTemplate.left_image : null}
              onChange={(left_image: UploadedImage | null) => setLeftImage(left_image)}
              onError={(error: Error | string) => props.form.notify(error)}
            />
            <CKEditor
              ref={leftInfoEditor}
              initialValue={props.initialValues?.header?.left_info || ""}
              onChange={(html: string) => setLeftInfo(html)}
            />
          </Form.ItemStyle>

          <Form.ItemStyle className={"export-header-side-item"} label={"Right Side"}>
            <UploadPdfImage
              onChange={(right_image: UploadedImage | null) => setRightImage(right_image)}
              onError={(error: Error | string) => props.form.notify(error)}
            />
            <CKEditor
              ref={rightInfoEditor}
              initialValue={props.initialValues?.header?.right_info || ""}
              onChange={(html: string) => setRightInfo(html)}
            />
          </Form.ItemStyle>
        </div>

        <HeaderTemplateSaveForm
          loading={headerTemplatesLoading}
          onLoad={onLoadHeaderTemplate}
          onClear={onClearHeaderTemplate}
          onHeaderTemplateDeleted={onHeaderTemplateDeleted}
          value={displayedHeaderTemplate}
          templates={headerTemplates}
          ref={saveFormRef}
          existing={!isNil(displayedHeaderTemplate)}
          saving={saving}
          onSave={onSave}
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
          <ColumnSelect<R, M, C>
            getLabel={(c: C) => c.pdfHeaderName || c.headerName || ""}
            columns={filter(columns, (c: C) => c.tableColumnType !== "fake")}
          />
        </Form.Item>

        <Form.ItemStyle label={"Show All Tables"}>
          <Checkbox
            defaultChecked={isNil(rawFormInitialValues?.tables)}
            checked={showAllTables}
            onChange={(e: CheckboxChangeEvent) => {
              const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
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
            suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />}
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
              const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
              props.onValuesChange?.({ includeNotes: checked }, { ...formData(values), includeNotes: checked });
              setIncludeNotes(checked);
            }}
          />
        </Form.Item>

        <ShowHide show={includeNotes}>
          <Form.ItemStyle>
            <CKEditor
              style={{ height: 140 }}
              initialValue={props.initialValues?.notes || ""}
              onChange={(html: string) => {
                setNotesHtml(html);
                const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
                props.onValuesChange?.({ notes: html }, { ...formData(values), notes: html });
              }}
            />
          </Form.ItemStyle>
        </ShowHide>
      </Form.ItemSection>
    </Form.Form>
  );
};

export default forwardRef(ExportForm);
