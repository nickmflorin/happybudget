import { isNil } from "lodash";
import { ValueSetterParams } from "@ag-grid-community/core";

import { models, tabling, util } from "lib";
import { columns } from "../../generic";

type R = Tables.ContactRowData;
type M = Model.Contact;

const Columns: Table.Column<Tables.ContactRowData, M>[] = [
  columns.FakeColumn({ field: "first_name", nullValue: null }),
  columns.FakeColumn({ field: "last_name", nullValue: null }),
  columns.FakeColumn({ field: "image", nullValue: null }),
  columns.BodyColumn<R, M, string | null>({
    field: "names_and_image",
    nullValue: null,
    headerName: "Name",
    dataType: "text",
    cellRenderer: { data: "ContactNameCell" },
    editable: true,
    cellClass: "cell--renders-html",
    width: 140,
    minWidth: 140,
    parseIntoFields: (value: string | null) => {
      const parsed = !isNil(value) ? models.parseFirstAndLastName(value) : null;
      return [
        { field: "first_name", value: !isNil(parsed) ? parsed[0] : null },
        { field: "last_name", value: !isNil(parsed) ? parsed[1] : null }
      ];
    },
    valueSetter: (params: ValueSetterParams) => {
      if (params.newValue === undefined || params.newValue === "" || params.newValue === null) {
        params.data.data.first_name = null;
        params.data.data.last_name = null;
      } else {
        const parsed = models.parseFirstAndLastName(params.newValue);
        params.data.data.first_name = parsed[0];
        params.data.data.last_name = parsed[1];
      }
      return true;
    },
    valueGetter: (row: Table.BodyRow<R>) =>
      tabling.typeguards.isModelRow(row) ? util.conditionalJoinString(row.data.first_name, row.data.last_name) : null
  }),
  columns.BodyColumn<R, M>({
    field: "company",
    nullValue: null,
    headerName: "Company",
    dataType: "text",
    width: 100,
    minWidth: 100
  }),
  columns.BodyColumn<R, M>({
    field: "position",
    nullValue: null,
    headerName: "Job Title",
    dataType: "text",
    width: 100,
    minWidth: 100
  }),
  columns.BodyColumn<R, M>({
    field: "phone_number",
    nullValue: null,
    headerName: "Phone Number",
    dataType: "phone",
    cellRenderer: { data: "PhoneNumberCell" },
    width: 120,
    minWidth: 120
  }),
  columns.BodyColumn<R, M>({
    field: "email",
    nullValue: null,
    headerName: "Email",
    dataType: "email",
    cellRenderer: { data: "EmailCell" },
    valueSetter: tabling.valueSetters.emailValueSetter("email"),
    width: 100,
    minWidth: 100
  }),
  columns.BodyColumn<R, M>({
    field: "rate",
    nullValue: null,
    headerName: "Rate",
    dataType: "currency",
    valueFormatter: tabling.formatters.currencyValueFormatter,
    valueSetter: tabling.valueSetters.numericValueSetter("rate"),
    width: 75,
    minWidth: 75
  }),
  columns.ChoiceSelectColumn<R, M, Model.ContactType | null>({
    field: "contact_type",
    nullValue: null,
    headerName: "Type",
    defaultHidden: true,
    cellRenderer: { data: "ContactTypeCell" },
    cellEditor: "ContactTypeEditor",
    processCellFromClipboard: (name: string) => models.findChoiceForName<Model.ContactType>(models.ContactTypes, name),
    width: 100,
    minWidth: 100
  }),
  columns.AttachmentsColumn({
    field: "attachments",
    width: 120,
    minWidth: 120
  })
];

export default Columns;
