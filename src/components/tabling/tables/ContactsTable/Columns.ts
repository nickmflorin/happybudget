import { model, tabling } from "lib";

import { framework } from "components/tabling/generic";

type R = Tables.ContactRowData;
type M = Model.Contact;

const Columns: Table.Column<Tables.ContactRowData, M>[] = [
  framework.columnObjs.BodyColumn<R, M>({
    field: "names_and_image",
    headerName: "Name",
    columnType: "text",
    cellRenderer: "ContactNameCell",
    editable: false,
    cellClass: "cell--renders-html",
    getRowValue: (m: M) => ({ image: m.image, first_name: m.first_name, last_name: m.last_name })
  }),
  framework.columnObjs.ChoiceSelectColumn<R, M, Model.ContactType>({
    field: "type",
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
