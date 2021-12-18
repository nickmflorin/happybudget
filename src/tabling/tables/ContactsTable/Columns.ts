import { isNil } from "lodash";
import { ValueSetterParams } from "@ag-grid-community/core";

import { models, tabling, util } from "lib";
import { columns } from "../../generic";

type R = Tables.ContactRowData;
type M = Model.Contact;

const Columns: Table.Column<Tables.ContactRowData, M>[] = [
  columns.FakeColumn({ field: "first_name" }),
  columns.FakeColumn({ field: "last_name" }),
  columns.FakeColumn({ field: "image" }),
  columns.BodyColumn<R, M, string | null>({
    colId: "names_and_image",
    headerName: "Name",
    columnType: "text",
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
    valueGetter: (row: Table.BodyRow<R>) => util.conditionalJoinString(row.data.first_name, row.data.last_name)
  }),
  columns.BodyColumn<R, M>({
    field: "company",
    headerName: "Company",
    columnType: "text",
    width: 100,
    minWidth: 100
  }),
  columns.BodyColumn<R, M>({
    field: "position",
    headerName: "Job Title",
    columnType: "text",
    width: 100,
    minWidth: 100
  }),
  columns.BodyColumn<R, M>({
    field: "phone_number",
    headerName: "Phone Number",
    columnType: "phone",
    cellRenderer: { data: "PhoneNumberCell" },
    width: 120,
    minWidth: 120
  }),
  columns.BodyColumn<R, M>({
    field: "email",
    headerName: "Email",
    columnType: "email",
    cellRenderer: { data: "EmailCell" },
    valueSetter: tabling.valueSetters.emailValueSetter<R>("email"),
    width: 100,
    minWidth: 100
  }),
  columns.BodyColumn<R, M>({
    field: "rate",
    headerName: "Rate",
    columnType: "currency",
    valueFormatter: tabling.formatters.currencyValueFormatter,
    valueSetter: tabling.valueSetters.numericValueSetter<R>("rate"),
    width: 75,
    minWidth: 75
  }),
  columns.ChoiceSelectColumn<R, M, Model.ContactType | null>({
    field: "contact_type",
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
