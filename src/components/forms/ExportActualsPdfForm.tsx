import { useRef, useMemo, forwardRef, ForwardedRef, useImperativeHandle } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { Switch } from "antd";

import { Form } from "components";
import { ColumnSelect, Input } from "components/fields";
import { CKEditor } from "components/richtext";

type NonFormFields = "header";
type RichTextFields = "header";

interface ExportActualsPdfFormProps extends FormProps<ExportActualsPdfFormOptions> {
  readonly disabled?: boolean;
  readonly columns: Table.DataColumn<Tables.ActualRowData, Model.Actual>[];
}

const ExportActualsPdfForm = (
  { columns, ...props }: ExportActualsPdfFormProps,
  ref: ForwardedRef<IExportFormRef>
): JSX.Element => {
  const headerEditor = useRef<IEditor>(null);

  const formData = useMemo(() => {
    return (values: Omit<ExportActualsPdfFormOptions, NonFormFields>): ExportActualsPdfFormOptions => {
      return { ...values, header: headerEditor.current?.getData() || null };
    };
  }, [headerEditor.current]);

  const setHeader = useMemo(
    () => (html: string) => {
      const values: ExportActualsPdfFormOptions = props.form.getFieldsValue();
      props.onValuesChange?.({ header: html }, { ...values, header: html });
    },
    []
  );

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const values: ExportActualsPdfFormOptions = props.form.getFieldsValue();
      return formData(values);
    }
  }));

  const rawFormInitialValues = useMemo<Omit<ExportActualsPdfFormOptions, RichTextFields> | undefined>(():
    | Omit<ExportActualsPdfFormOptions, RichTextFields>
    | undefined => {
    if (!isNil(props.initialValues)) {
      const { ...rest } = props.initialValues as ExportActualsPdfFormOptions;
      return rest;
    }
    return undefined;
  }, [props.initialValues]);

  return (
    <Form.Form
      {...props}
      autoFocusField={false}
      initialValues={rawFormInitialValues}
      condensed={true}
      className={classNames("export-form", props.className)}
      layout={"vertical"}
    >
      <Form.ItemStyle label={"Header"}>
        <CKEditor
          ref={headerEditor}
          initialValue={props.initialValues?.header || ""}
          onChange={(html: string) => setHeader(html)}
        />
      </Form.ItemStyle>

      <Form.ItemSection
        label={"Table Options"}
        labelClassName={"label label--section"}
        labelStyle={{ marginBottom: "5px !important" }}
      >
        <Form.Item name={"date"} label={"Budget Date"}>
          <Input />
        </Form.Item>

        <Form.Item label={"Columns"} name={"columns"}>
          <ColumnSelect<Tables.ActualRowData, Model.Actual>
            getLabel={(c: Table.DataColumn<Tables.ActualRowData, Model.Actual>) =>
              c.pdfHeaderName || c.headerName || ""
            }
            columns={columns}
          />
        </Form.Item>

        <Form.Item valuePropName={"checked"} name={"excludeZeroTotals"} label={"Exclude Accounts Totalling Zero"}>
          <Switch
            checkedChildren={"ON"}
            unCheckedChildren={"OFF"}
            defaultChecked={props.initialValues?.excludeZeroTotals === true}
          />
        </Form.Item>
      </Form.ItemSection>
    </Form.Form>
  );
};

export default forwardRef(ExportActualsPdfForm);
