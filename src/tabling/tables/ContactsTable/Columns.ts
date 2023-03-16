import { isNil } from "lodash";
import { ValueSetterParams } from "@ag-grid-community/core";

import { model, tabling, util, formatters } from "lib";

import { columns } from "../../generic";

type R = Tables.ContactRowData;
type M = Model.Contact;

const Columns: Table.Column<Tables.ContactRowData, M>[] = [
  columns.FakeColumn({ field: "first_name", nullValue: null }),
  columns.FakeColumn({ field: "last_name", nullValue: null }),
  columns.FakeColumn({ field: "image", nullValue: null }),
  columns.BodyColumn<R, M, string | null>({
    field: "names_and_image",
    isRead: false,
    nullValue: null,
    headerName: "Name",
    dataType: "text",
    cellRenderer: { data: "ContactNameCell" },
    editable: true,
    cellClass: "cell--renders-html",
    width: 140,
    minWidth: 140,
    parsedFields: ["first_name", "last_name"],
    parseIntoFields: (value: string | null) => {
      const parsed = !isNil(value) ? model.parseFirstAndLastName(value) : null;
      return [
        { field: "first_name", value: !isNil(parsed) ? parsed[0] : null },
        { field: "last_name", value: !isNil(parsed) ? parsed[1] : null },
      ];
    },
    valueSetter: (params: ValueSetterParams) => {
      if (params.newValue === undefined || params.newValue === "" || params.newValue === null) {
        params.data.data.first_name = null;
        params.data.data.last_name = null;
      } else {
        const parsed = model.parseFirstAndLastName(params.newValue);
        params.data.data.first_name = parsed[0];
        params.data.data.last_name = parsed[1];
      }
      return true;
    },
    valueGetter: (row: Table.BodyRow<R>) =>
      tabling.rows.isModelRow(row)
        ? util.conditionalJoinString(row.data.first_name, row.data.last_name)
        : null,
  }),
  columns.BodyColumn<R, M>({
    field: "company",
    nullValue: null,
    headerName: "Company",
    dataType: "text",
    width: 100,
    minWidth: 100,
  }),
  columns.BodyColumn<R, M>({
    field: "position",
    nullValue: null,
    headerName: "Job Title",
    dataType: "text",
    width: 100,
    minWidth: 100,
  }),
  columns.BodyColumn<R, M>({
    field: "phone_number",
    nullValue: null,
    headerName: "Phone Number",
    dataType: "phone",
    cellRenderer: { data: "PhoneNumberCell" },
    width: 120,
    minWidth: 120,
  }),
  columns.BodyColumn<R, M>({
    field: "email",
    nullValue: null,
    headerName: "Email",
    dataType: "email",
    cellRenderer: { data: "EmailCell" },
    valueSetter: tabling.columns.emailValueSetter("email"),
    width: 100,
    minWidth: 100,
  }),
  columns.BodyColumn<R, M>({
    field: "rate",
    nullValue: null,
    headerName: "Rate",
    dataType: "currency",
    valueFormatter: formatters.currencyFormatter((v: string | number) =>
      console.error(`Could not parse currency value ${String(v)} for field 'rate'.`),
    ),
    valueSetter: tabling.columns.numericValueSetter("rate"),
    width: 75,
    minWidth: 75,
  }),
  columns.ChoiceSelectColumn<R, M, Model.ContactType | null>({
    field: "contact_type",
    nullValue: null,
    headerName: "Type",
    defaultHidden: true,
    cellRenderer: { data: "ContactTypeCell" },
    cellEditor: "ContactTypeEditor",
    processCellFromClipboard: (name: string) => model.contact.ContactTypes.infer(name),
    width: 100,
    minWidth: 100,
  }),
  columns.AttachmentsColumn({
    field: "attachments",
    width: 120,
    minWidth: 120,
  }),
  columns.BodyColumn<R, M>({
    field: "notes",
    nullValue: null,
    headerName: "Notes",
    width: 100,
    minWidth: 100,
    flex: 1,
    dataType: "longText",
  }),
];

export default Columns;
