import { useState, useMemo } from "react";
import classNames from "classnames";
import { map, isNil, find } from "lodash";

import { Select, Switch, Tag, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons";

import * as models from "lib/model";

import { Form, ShowHide } from "components";
import { EntityText } from "components/typography";
import { Editor } from "components/richtext";
import { EntityTextDescription } from "components/typography/EntityText";
import { FormProps } from "components/forms/Form";
import { UploadPdfImage } from "./fields";

import "./ExportForm.scss";

// Does not seem to be exportable from AntD/RCSelect so we just copy it here.
type CustomTagProps = {
  label: React.ReactNode;
  value: any;
  disabled: boolean;
  onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  closable: boolean;
};

type Column = PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>;
type NonFormFields = "leftImage" | "rightImage" | "header" | "leftInfo" | "rightInfo" | "notes";

interface ExportFormProps extends FormProps<PdfBudgetTable.Options> {
  readonly disabled?: boolean;
  readonly columns: Column[];
  readonly accounts: Model.PdfAccount[];
  readonly accountsLoading?: boolean;
}

const ExportForm: React.FC<ExportFormProps> = ({
  accountsLoading,
  accounts,
  disabled,
  columns,
  ...props
}): JSX.Element => {
  const [showAllTables, setShowAllTables] = useState(isNil(props.initialValues?.tables));
  const [leftImageFile, setLeftImageFile] = useState<File | Blob | null>(props.initialValues?.leftImage || null);
  const [rightImageFile, setRightImageFile] = useState<File | Blob | null>(props.initialValues?.rightImage || null);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [headerBlocks, setHeaderBlocks] = useState<RichText.Block[]>(props.initialValues?.header || []);
  const [leftInfoBlocks, setLeftInfoBlocks] = useState<RichText.Block[]>(props.initialValues?.leftInfo || []);
  const [rightInfoBlocks, setRightInfoBlocks] = useState<RichText.Block[]>(props.initialValues?.rightInfo || []);
  const [notesBlocks, setNotesBlocks] = useState<RichText.Block[]>(props.initialValues?.notes || []);

  const payload = useMemo(() => {
    return (values: Omit<PdfBudgetTable.Options, NonFormFields>): PdfBudgetTable.Options => {
      let options: Partial<PdfBudgetTable.Options> = {
        ...values,
        leftImage: leftImageFile,
        rightImage: rightImageFile,
        header: headerBlocks,
        leftInfo: leftInfoBlocks,
        rightInfo: rightInfoBlocks,
        includeNotes
      };
      if (includeNotes === true) {
        options = { ...options, notes: notesBlocks };
      }
      return options as PdfBudgetTable.Options;
    };
  }, [leftImageFile, rightImageFile, headerBlocks, leftInfoBlocks, rightInfoBlocks, notesBlocks, includeNotes]);

  const initialValues = useMemo<Omit<PdfBudgetTable.Options, NonFormFields> | undefined>(():
    | Omit<PdfBudgetTable.Options, NonFormFields>
    | undefined => {
    if (!isNil(props.initialValues)) {
      const { leftImage, rightImage, header, leftInfo, rightInfo, ...rest } =
        props.initialValues as PdfBudgetTable.Options;
      return rest;
    }
    return undefined;
  }, [props.initialValues]);

  return (
    <Form.Form
      {...props}
      initialValues={initialValues}
      className={classNames("export-form", "condensed", props.className)}
      onFinish={(values: Omit<PdfBudgetTable.Options, NonFormFields>) => {
        props.onFinish?.(payload(values));
      }}
      onValuesChange={(
        changedValues: Partial<Omit<PdfBudgetTable.Options, NonFormFields>>,
        values: Omit<PdfBudgetTable.Options, NonFormFields>
      ) => {
        // Note: Since the images are not included as a part of the underlying Form mechanics,
        // they will not trigger this hook.  This means that we have to manually call the
        // onValuesChange() hook when the images change.
        props.onValuesChange?.(changedValues, payload(values));
      }}
    >
      <Form.ItemStyle label={"Header"} labelClassName={"label label--section"}>
        <Editor
          value={props.initialValues?.header}
          onChange={(blocks?: RichText.Block[]) => {
            blocks = !isNil(blocks) ? blocks : [];
            setHeaderBlocks(blocks);
            const values: PdfBudgetTable.Options = props.form.getFieldsValue();
            props.onValuesChange?.({ header: blocks }, { ...payload(values), header: blocks });
          }}
        />
      </Form.ItemStyle>

      <div className={"export-header-sides"}>
        <Form.ItemStyle
          label={"Left Side"}
          className={"export-header-side-item"}
          labelClassName={"label label--section"}
        >
          <UploadPdfImage
            onChange={(f: UploadedData | null) => {
              const values: PdfBudgetTable.Options = props.form.getFieldsValue();
              // Images are not included in traditional form and thus do not trigger the
              // onValuesChange() callback - so we have to do it manually here.
              props.onValuesChange?.(
                { leftImage: !isNil(f) ? f.file : null },
                { ...payload(values), leftImage: !isNil(f) ? f.file : null }
              );
              setLeftImageFile(!isNil(f) ? f.file : null);
            }}
            onError={(error: Error | string) => props.form.setGlobalError(error)}
          />
          <Editor
            value={props.initialValues?.leftInfo}
            onChange={(blocks?: RichText.Block[]) => {
              blocks = !isNil(blocks) ? blocks : [];
              setLeftInfoBlocks(blocks);
              const values: PdfBudgetTable.Options = props.form.getFieldsValue();
              props.onValuesChange?.({ leftInfo: blocks }, { ...payload(values), leftInfo: blocks });
            }}
          />
        </Form.ItemStyle>

        <Form.ItemStyle
          className={"export-header-side-item"}
          label={"Right Side"}
          labelClassName={"label label--section"}
        >
          <UploadPdfImage
            onChange={(f: UploadedData | null) => {
              const values: PdfBudgetTable.Options = props.form.getFieldsValue();
              // Images are not included in traditional form and thus do not trigger the
              // onValuesChange() callback - so we have to do it manually here.
              props.onValuesChange?.(
                { leftImage: !isNil(f) ? f.file : null },
                { ...payload(values), rightImage: !isNil(f) ? f.file : null }
              );
              setRightImageFile(!isNil(f) ? f.file : null);
            }}
            onError={(error: Error | string) => props.form.setGlobalError(error)}
          />
          <Editor
            value={props.initialValues?.rightInfo}
            onChange={(blocks?: RichText.Block[]) => {
              blocks = !isNil(blocks) ? blocks : [];
              setRightInfoBlocks(blocks);
              const values: PdfBudgetTable.Options = props.form.getFieldsValue();
              props.onValuesChange?.({ rightInfo: blocks }, { ...payload(values), rightInfo: blocks });
            }}
          />
        </Form.ItemStyle>
      </div>

      <Form.ItemSection label={"Table Options"} labelClassName={"label label--section"}>
        <Form.Item label={"Columns"} name={"columns"}>
          <Select
            suffixIcon={<FontAwesomeIcon icon={faCaretDown} />}
            mode={"multiple"}
            showArrow
            tagRender={(params: CustomTagProps) => {
              const column = find(columns, { field: params.value });
              if (!isNil(column)) {
                const colType = find(models.ColumnTypes, { id: column.columnType });
                return (
                  <Tag className={"column-select-tag"} style={{ marginRight: 3 }} {...params}>
                    {!isNil(colType) && !isNil(colType.icon) && (
                      <div className={"icon-wrapper"}>
                        <FontAwesomeIcon className={"icon"} icon={colType.icon} />
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
              const colType = find(models.ColumnTypes, { id: column.columnType });
              return (
                <Select.Option className={"column-select-option"} key={index + 1} value={column.field as string}>
                  {!isNil(colType) && !isNil(colType.icon) && (
                    <div className={"icon-wrapper"}>
                      <FontAwesomeIcon className={"icon"} icon={colType.icon} />
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
            defaultChecked={isNil(initialValues?.tables)}
            checked={showAllTables}
            onChange={(e: CheckboxChangeEvent) => {
              const values: PdfBudgetTable.Options = props.form.getFieldsValue();
              setShowAllTables(e.target.checked);
              if (e.target.checked === true) {
                props.form.setFields([{ name: "tables", value: undefined }]);
                props.onValuesChange?.({ tables: undefined }, { ...payload(values), tables: undefined });
              } else {
                props.form.setFields([{ name: "tables", value: [] }]);
                props.onValuesChange?.({ tables: [] }, { ...payload(values), tables: [] });
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
            defaultChecked={initialValues?.excludeZeroTotals === true}
          />
        </Form.Item>
      </Form.ItemSection>

      <Form.ItemSection label={"Notes"} labelClassName={"label--section"}>
        <Form.Item label={"Include Notes Section"}>
          <Switch
            checkedChildren={"ON"}
            unCheckedChildren={"OFF"}
            defaultChecked={false}
            onChange={(checked: boolean) => {
              const values: PdfBudgetTable.Options = props.form.getFieldsValue();
              props.onValuesChange?.({ includeNotes: checked }, { ...payload(values), includeNotes: checked });
              setIncludeNotes(checked);
            }}
          />
        </Form.Item>

        <ShowHide show={includeNotes}>
          <Form.Item name={"notes"}>
            <Editor
              style={{ height: 140 }}
              value={props.initialValues?.notes}
              onChange={(blocks?: RichText.Block[]) => {
                blocks = !isNil(blocks) ? blocks : [];
                setNotesBlocks(blocks);
                const values: PdfBudgetTable.Options = props.form.getFieldsValue();
                props.onValuesChange?.({ notes: blocks }, { ...payload(values), notes: blocks });
              }}
            />
          </Form.Item>
        </ShowHide>
      </Form.ItemSection>
    </Form.Form>
  );
};

export default ExportForm;
