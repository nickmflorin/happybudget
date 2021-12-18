import { forwardRef, ForwardedRef, useImperativeHandle } from "react";
import classNames from "classnames";
import { filter } from "lodash";

import { Switch } from "antd";

import { Form } from "components";
import { ColumnSelect } from "components/fields";

interface ExportActualsPdfFormProps extends FormProps<ExportPdfFormOptions> {
  readonly columns: Table.Column<Tables.ActualRowData, Model.Actual>[];
}

const ExportActualsPdfForm = (
  { columns, ...props }: ExportActualsPdfFormProps,
  ref: ForwardedRef<IExportFormRef>
): JSX.Element => {
  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const values: ExportPdfFormOptions = props.form.getFieldsValue();
      return values;
    }
  }));

  return (
    <Form.Form
      {...props}
      autoFocusField={false}
      condensed={true}
      className={classNames("export-form", props.className)}
      layout={"vertical"}
    >
      <Form.ItemSection
        label={"Table Options"}
        labelClassName={"label label--section"}
        labelStyle={{ marginBottom: "5px !important" }}
      >
        <Form.Item label={"Columns"} name={"columns"}>
          <ColumnSelect<Tables.ActualRowData, Model.Actual>
            getLabel={(c: Table.Column<Tables.ActualRowData, Model.Actual>) => c.pdfHeaderName || c.headerName || ""}
            columns={filter(
              columns,
              (c: Table.Column<Tables.ActualRowData, Model.Actual>) => c.tableColumnType !== "fake"
            )}
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
