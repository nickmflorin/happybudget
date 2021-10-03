import { isNil } from "lodash";
import { ValueGetterParams, ValueSetterParams } from "@ag-grid-community/core";

import { model, tabling, util } from "lib";
import { framework } from "components/tabling/generic";

type R = Tables.ContactRowData;
type M = Model.Contact;

const Columns: Table.Column<Tables.ContactRowData, M>[] = [
  framework.columnObjs.FakeColumn({ field: "first_name" }),
  framework.columnObjs.FakeColumn({ field: "last_name" }),
  framework.columnObjs.FakeColumn({ field: "image" }),
  framework.columnObjs.BodyColumn<R, M>({
    colId: "names_and_image",
    headerName: "Name",
    columnType: "text",
    cellRenderer: { data: "ContactNameCell" },
    editable: true,
    cellClass: "cell--renders-html",
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
  framework.columnObjs.ChoiceSelectColumn<R, M, Model.ContactType>({
    field: "contact_type",
    headerName: "Type",
    defaultHidden: true,
    cellRenderer: { data: "ContactTypeCell" },
    cellEditor: "ContactTypeEditor",
    models: model.models.ContactTypes
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "company",
    headerName: "Company",
    columnType: "text"
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "position",
    headerName: "Position",
    columnType: "text"
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "phone_number",
    headerName: "Phone Number",
    columnType: "phone",
    cellRenderer: { data: "PhoneNumberCell" }
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "email",
    headerName: "Email",
    columnType: "email",
    cellRenderer: { data: "EmailCell" },
    valueSetter: tabling.valueSetters.emailValueSetter<R>("email")
  })
];

export default Columns;
