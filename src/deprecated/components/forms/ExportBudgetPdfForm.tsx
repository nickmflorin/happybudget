import {
  useState,
  useMemo,
  useRef,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
  useEffect,
} from "react";

import classNames from "classnames";
import { isNil, debounce } from "lodash";
import { Switch, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import * as api from "api";
import { model, ui } from "lib";
import { Form, ShowHide, Separator } from "components";
import { ColumnSelect, Input, CKEditor, AccountTableSelect } from "deprecated/components/fields";
import { PdfImageUploader } from "deprecated/components/fields/uploaders";

import HeaderTemplateSaveForm, { IHeaderTemplateSaveFormRef } from "./HeaderTemplateSaveForm";

type NonFormFields = "includeNotes" | "notes" | "header";
type RichTextFields = "notes" | "header";

type R = Tables.SubAccountRowData;
type M = Model.PdfSubAccount;
type C = Table.DataColumn<R, M>;

interface ExportFormProps extends FormProps<ExportBudgetPdfFormOptions> {
  readonly columns: C[];
  readonly accounts: Model.PdfAccount[];
  readonly accountsLoading?: boolean;
}

const ExportForm = (
  { accountsLoading, accounts, columns, ...props }: ExportFormProps,
  ref: ForwardedRef<IExportFormRef<ExportBudgetPdfFormOptions>>,
): JSX.Element => {
  const select = ui.select.useHeaderTemplateSelect();
  const [displayedHeaderTemplate, setDisplayedHeaderTemplate] =
    useState<Model.HeaderTemplate | null>(null);

  const suppressValueChangeTrigger = useRef(false);
  const leftInfoEditor = useRef<IEditor>(null);
  const rightInfoEditor = useRef<IEditor>(null);
  const headerEditor = useRef<IEditor>(null);

  const saveFormRef = useRef<IHeaderTemplateSaveFormRef>(null);
  const [saving, setSaving] = useState(false);
  const [showAllTables, setShowAllTables] = useState(isNil(props.initialValues?.tables));
  const [includeNotes, setIncludeNotes] = useState(false);
  const [notesHtml, setNotesHtml] = useState<string | null>(props.initialValues?.notes || null);
  const [leftImage, _setLeftImage] = useState<UploadedImage | SavedImage | null>(null);
  const [rightImage, _setRightImage] = useState<UploadedImage | SavedImage | null>(null);

  const _formDataWithoutHeader = useMemo(
    () =>
      (
        values: Omit<ExportBudgetPdfFormOptions, NonFormFields>,
      ): Omit<ExportBudgetPdfFormOptions, "header"> => {
        let options: Partial<ExportBudgetPdfFormOptions> = {
          ...values,
          includeNotes,
        };
        if (includeNotes === true) {
          options = { ...options, notes: notesHtml };
        }
        return options as ExportBudgetPdfFormOptions;
      },
    [notesHtml, includeNotes],
  );

  const getHeaderTemplateData = useMemo<() => HeaderTemplateFormData>(
    () => (): HeaderTemplateFormData => ({
      header: headerEditor.current?.getData() || null,
      left_info: leftInfoEditor.current?.getData() || null,
      right_info: rightInfoEditor.current?.getData() || null,
      right_image: rightImage,
      left_image: leftImage,
    }),
    [headerEditor.current, leftInfoEditor.current, rightInfoEditor.current, leftImage, rightImage],
  );

  const formData = useMemo(
    () =>
      (values: Omit<ExportBudgetPdfFormOptions, NonFormFields>): ExportBudgetPdfFormOptions => ({
        ..._formDataWithoutHeader(values),
        header: getHeaderTemplateData(),
      }),
    [_formDataWithoutHeader, getHeaderTemplateData],
  );

  const _setHeader = useMemo(
    () => (header: HeaderTemplateFormData) => {
      headerEditor.current?.setData(header.header || "");
      leftInfoEditor.current?.setData(header.left_info || "");
      rightInfoEditor.current?.setData(header.right_info || "");
      _setRightImage(header.right_image);
      _setLeftImage(header.left_image);
    },
    [],
  );

  useEffect(() => {
    suppressValueChangeTrigger.current = true;
    if (!isNil(displayedHeaderTemplate)) {
      _setHeader(displayedHeaderTemplate);
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      props.onValuesChange?.(
        { header: displayedHeaderTemplate },
        { ..._formDataWithoutHeader(values), header: displayedHeaderTemplate },
      );
    } else {
      const header = props.initialValues?.header || {
        header: "",
        left_image: null,
        right_image: null,
        left_info: "",
        right_info: "",
      };
      _setHeader(header);
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      props.onValuesChange?.({ header }, { ..._formDataWithoutHeader(values), header });
    }
    suppressValueChangeTrigger.current = false;
  }, [displayedHeaderTemplate]);

  const setLeftImage = useMemo(
    () => (img: UploadedImage | SavedImage | null) => {
      _setLeftImage(img);
      /* If changing multiple fields at the same time, which happens when the
         displayed header template changes, we do not want to submit value change
         callbacks for every single one - just one single callback at the end. */
      if (suppressValueChangeTrigger.current !== true) {
        const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
        props.onValuesChange?.(
          { header: { ...getHeaderTemplateData(), left_image: img } },
          {
            ..._formDataWithoutHeader(values),
            header: { ...getHeaderTemplateData(), left_image: img },
          },
        );
      }
    },
    [_formDataWithoutHeader, getHeaderTemplateData, suppressValueChangeTrigger.current],
  );

  const setRightImage = useMemo(
    () => (img: UploadedImage | SavedImage | null) => {
      _setRightImage(img);
      /* If changing multiple fields at the same time, which happens when the
         displayed header template changes, we do not want to submit value change
         callbacks for every single one - just one single callback at the end. */
      if (suppressValueChangeTrigger.current !== true) {
        const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
        props.onValuesChange?.(
          { header: { ...getHeaderTemplateData(), right_image: img } },
          {
            ..._formDataWithoutHeader(values),
            header: { ...getHeaderTemplateData(), right_image: img },
          },
        );
      }
    },
    [_formDataWithoutHeader, getHeaderTemplateData, suppressValueChangeTrigger.current],
  );

  const setHeader = useMemo(
    () => (html: string) => {
      /* If changing multiple fields at the same time, which happens when the
         displayed header template changes, we do not want to submit value change
         callbacks for every single one - just one single callback at the end. */
      if (suppressValueChangeTrigger.current !== true) {
        const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
        props.onValuesChange?.(
          { header: { ...getHeaderTemplateData(), header: html } },
          {
            ..._formDataWithoutHeader(values),
            header: { ...getHeaderTemplateData(), header: html },
          },
        );
      }
    },
    [_formDataWithoutHeader, getHeaderTemplateData, suppressValueChangeTrigger.current],
  );

  const setLeftInfo = useMemo(
    () => (html: string) => {
      /* If changing multiple fields at the same time, which happens when the
         displayed header template changes, we do not want to submit value change
         callbacks for every single one - just one single callback at the end. */
      if (suppressValueChangeTrigger.current !== true) {
        const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
        props.onValuesChange?.(
          { header: { ...getHeaderTemplateData(), left_info: html } },
          {
            ..._formDataWithoutHeader(values),
            header: { ...getHeaderTemplateData(), left_info: html },
          },
        );
      }
    },
    [_formDataWithoutHeader, getHeaderTemplateData, suppressValueChangeTrigger.current],
  );

  const setRightInfo = useMemo(
    () => (html: string) => {
      /* If changing multiple fields at the same time, which happens when the
         displayed header template changes, we do not want to submit value change
         callbacks for every single one - just one single callback at the end. */
      if (suppressValueChangeTrigger.current !== true) {
        const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
        props.onValuesChange?.(
          { header: { ...getHeaderTemplateData(), right_info: html } },
          {
            ..._formDataWithoutHeader(values),
            header: { ...getHeaderTemplateData(), right_info: html },
          },
        );
      }
    },
    [_formDataWithoutHeader, getHeaderTemplateData, suppressValueChangeTrigger.current],
  );

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
      return formData(values);
    },
  }));

  const rawFormInitialValues = useMemo<
    Omit<ExportBudgetPdfFormOptions, RichTextFields> | undefined
  >((): Omit<ExportBudgetPdfFormOptions, RichTextFields> | undefined => {
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
        name,
      };
      if (!isNil(data.left_image) && model.isUploadedImage(data.left_image)) {
        requestPayload = { ...requestPayload, left_image: data.left_image.data };
      }
      if (!isNil(data.right_image) && model.isUploadedImage(data.right_image)) {
        requestPayload = { ...requestPayload, right_image: data.right_image.data };
      }
      if (!isNil(original)) {
        requestPayload = { ...requestPayload, original: original.id };
      }
      setSaving(true);
      api
        .createHeaderTemplate(requestPayload)
        .then((response: Model.HeaderTemplate) => {
          select.current.addOption(response);
          setDisplayedHeaderTemplate(response);
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
          if (e instanceof api.FieldsError && !isNil(saveFormRef.current)) {
            const fldError = e.getError("name");
            if (!isNil(fldError)) {
              manuallySetFieldError = true;
              if (fldError.code === "unique") {
                saveFormRef.current.setError("The template name must be unique.");
              } else {
                saveFormRef.current.setError(fldError.message);
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
    [getHeaderTemplateData],
  );

  const updateTemplate = useMemo(
    () => (template: Model.HeaderTemplate) => {
      const data: HeaderTemplateFormData = getHeaderTemplateData();
      let requestPayload: Http.HeaderTemplatePayload = {
        left_info: data.left_info,
        header: data.header,
        right_info: data.right_info,
      };
      /* We only want to include the images in the payload if they were changed
				 - this means they are either null or of the UploadedImage form. */
      if (!isNil(data.left_image) && model.isUploadedImage(data.left_image)) {
        requestPayload = { ...requestPayload, left_image: data.left_image.data };
      } else if (isNil(data.left_image)) {
        requestPayload = { ...requestPayload, left_image: null };
      }
      if (!isNil(data.right_image) && model.isUploadedImage(data.right_image)) {
        requestPayload = { ...requestPayload, right_image: data.right_image.data };
      } else if (isNil(data.right_image)) {
        requestPayload = { ...requestPayload, right_image: null };
      }
      setSaving(true);
      api
        .updateHeaderTemplate(template.id, requestPayload)
        .then(() => {
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
    [getHeaderTemplateData],
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
    [createTemplate, updateTemplate, displayedHeaderTemplate],
  );

  const debouncedSave = useMemo(() => debounce(onSave, 400), [onSave]);

  useEffect(
    () => () => {
      debouncedSave.cancel();
    },
    [],
  );

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
        values: Omit<ExportBudgetPdfFormOptions, NonFormFields>,
      ) => {
        /* Note: Since the images are not included as a part of the underlying
					 Form mechanics, they will not trigger this hook.  This means that we
					 have to manually call the onValuesChange() hook when the images
					 change. */
        props.onValuesChange?.(changedValues, formData(values));
      }}
      layout="vertical"
    >
      <Form.ItemSection label="Header">
        <Form.Item label="Title">
          <CKEditor
            ref={headerEditor}
            initialValue={props.initialValues?.header?.header || ""}
            onChange={(html: string) => setHeader(html)}
          />
        </Form.Item>
        <div className="export-header-sides">
          <Form.Item label="Left Side" className="export-header-side-item">
            <PdfImageUploader
              value={leftImage}
              onChange={(left_image: UploadedImage | null) => setLeftImage(left_image)}
              onError={(error: Error | string) => props.form.notify(error)}
            />
            <CKEditor
              ref={leftInfoEditor}
              initialValue={props.initialValues?.header?.left_info || ""}
              onChange={(html: string) => setLeftInfo(html)}
            />
          </Form.Item>
          <Form.Item className="export-header-side-item" label="Right Side">
            <PdfImageUploader
              value={rightImage}
              onChange={(right_image: UploadedImage | null) => setRightImage(right_image)}
              onError={(error: Error | string) => props.form.notify(error)}
            />
            <CKEditor
              ref={rightInfoEditor}
              initialValue={props.initialValues?.header?.right_info || ""}
              onChange={(html: string) => setRightInfo(html)}
            />
          </Form.Item>
        </div>
        <HeaderTemplateSaveForm
          value={displayedHeaderTemplate}
          onChange={(m: Model.HeaderTemplate | null) => setDisplayedHeaderTemplate(m)}
          onDeleted={(id: number) => {
            if (!isNil(displayedHeaderTemplate) && id === displayedHeaderTemplate.id) {
              setDisplayedHeaderTemplate(null);
            }
          }}
          ref={saveFormRef}
          select={select}
          saving={saving}
          onSave={onSave}
          style={{ marginTop: 10 }}
        />
      </Form.ItemSection>
      <Separator style={{ margin: "2px auto" }} />
      <Form.ItemSection label="Table Options">
        <Form.Item name="date" label="Budget Date">
          <Input />
        </Form.Item>
        <Form.Item label="Columns" name="columns">
          <ColumnSelect<R, M, C>
            getOptionLabel={(c: C) => c.pdfHeaderName || c.headerName || ""}
            options={columns}
          />
        </Form.Item>
        <Form.Item label="Show All Tables" horizontalLayoutOverride={true}>
          <Checkbox
            defaultChecked={isNil(rawFormInitialValues?.tables)}
            checked={showAllTables}
            onChange={(e: CheckboxChangeEvent) => {
              const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
              setShowAllTables(e.target.checked);
              if (e.target.checked === true) {
                props.form.setFields([{ name: "tables", value: undefined }]);
                props.onValuesChange?.(
                  { tables: undefined },
                  { ...formData(values), tables: undefined },
                );
              } else {
                props.form.setFields([{ name: "tables", value: [] }]);
                props.onValuesChange?.({ tables: [] }, { ...formData(values), tables: [] });
              }
            }}
          />
        </Form.Item>
        <Form.Item label="Tables" name="tables" style={{ marginBottom: 5 }}>
          <AccountTableSelect
            isDisabled={accountsLoading || showAllTables}
            isLoading={accountsLoading}
            options={accounts}
          />
        </Form.Item>
        <Form.Item
          valuePropName="checked"
          name="excludeZeroTotals"
          label="Exclude Accounts Totalling Zero"
        >
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            defaultChecked={rawFormInitialValues?.excludeZeroTotals === true}
          />
        </Form.Item>
      </Form.ItemSection>
      <Separator style={{ margin: "2px auto" }} />
      <Form.ItemSection label="Notes">
        <Form.Item label="Include Notes Section">
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            defaultChecked={false}
            onChange={(checked: boolean) => {
              const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
              props.onValuesChange?.(
                { includeNotes: checked },
                { ...formData(values), includeNotes: checked },
              );
              setIncludeNotes(checked);
            }}
          />
        </Form.Item>
        <ShowHide show={includeNotes}>
          <Form.Item>
            <CKEditor
              style={{ height: 140 }}
              initialValue={props.initialValues?.notes || ""}
              onChange={(html: string) => {
                setNotesHtml(html);
                const values: ExportBudgetPdfFormOptions = props.form.getFieldsValue();
                props.onValuesChange?.({ notes: html }, { ...formData(values), notes: html });
              }}
            />
          </Form.Item>
        </ShowHide>
      </Form.ItemSection>
    </Form.Form>
  );
};

export default forwardRef(ExportForm);
