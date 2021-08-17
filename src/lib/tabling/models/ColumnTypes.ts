const ColumnTypes: Table.ColumnType[] = [
  {
    id: "action"
  },
  {
    id: "text",
    icon: "font-case",
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "longText",
    icon: "align-left",
    style: { textAlign: "left" }
  },
  {
    id: "singleSelect",
    icon: "caret-circle-down",
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } },
    editorIsPopup: true
  },
  {
    id: "contact",
    icon: "user",
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "phone",
    icon: "phone",
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "email",
    icon: "envelope",
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "number",
    icon: "hashtag",
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "currency",
    icon: "dollar-sign",
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "sum",
    icon: "equals",
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "date",
    icon: "calendar-day",
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "percentage",
    icon: "percentage",
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  }
];

export default ColumnTypes;
