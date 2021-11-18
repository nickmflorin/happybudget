import { isNil } from "lodash";
import { ValueGetterParams, ValueSetterParams } from "@ag-grid-community/core";

import { model, tabling, util } from "lib";

type R = Tables.ContactRowData;
type M = Model.Contact;

const Columns: Table.Column<Tables.ContactRowData, M>[] = [
  tabling.columns.FakeColumn({ field: "first_name" }),
  tabling.columns.FakeColumn({ field: "last_name" }),
  tabling.columns.FakeColumn({ field: "image" }),
  tabling.columns.BodyColumn<R, M, string | null>({
    colId: "names_and_image",
    headerName: "Name",
    columnType: "text",
    cellRenderer: { data: "ContactNameCell" },
    editable: true,
    cellClass: "cell--renders-html",
    getCSVValue: (row: Table.BodyRow<Tables.ContactRowData>) => {
      return util.conditionalJoinString(row.data.first_name, row.data.last_name);
    },
    parseIntoFields: (value: string | null) => {
      const parsed = !isNil(value) ? model.util.parseFirstAndLastName(value) : null;
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
        const parsed = model.util.parseFirstAndLastName(params.newValue);
        params.data.data.first_name = parsed[0];
        params.data.data.last_name = parsed[1];
      }
      return true;
    },
    valueGetter: (params: ValueGetterParams) => {
      if (!isNil(params.node)) {
        const row: Table.Row<Tables.ContactRowData> = params.node.data;
        if (tabling.typeguards.isBodyRow(row)) {
          return util.conditionalJoinString(row.data.first_name, row.data.last_name);
        }
      }
      return null;
    }
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "company",
    headerName: "Company",
    columnType: "text"
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "position",
    headerName: "Position",
    columnType: "text"
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "phone_number",
    headerName: "Phone Number",
    columnType: "phone",
    cellRenderer: { data: "PhoneNumberCell" }
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "email",
    headerName: "Email",
    columnType: "email",
    cellRenderer: { data: "EmailCell" },
    valueSetter: tabling.valueSetters.emailValueSetter<R>("email")
  }),
  tabling.columns.AttachmentsColumn({
    field: "attachments",
    width: 140,
    minWidth: 140
  }),
  tabling.columns.BodyColumn<R, M>({
    field: "rate",
    headerName: "Rate",
    columnType: "currency",
    valueFormatter: tabling.formatters.currencyValueFormatter,
    valueSetter: tabling.valueSetters.floatValueSetter<R>("rate")
  }),
  tabling.columns.ChoiceSelectColumn<R, M, Model.ContactType>({
    field: "contact_type",
    headerName: "Type",
    defaultHidden: true,
    cellRenderer: { data: "ContactTypeCell" },
    cellEditor: "ContactTypeEditor",
    processCellFromClipboard: (name: string) =>
      model.util.findChoiceForName<Model.ContactType>(model.models.ContactTypes, name)
  })
];

export default Columns;
