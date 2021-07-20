import {
  faFontCase,
  faAlignLeft,
  faCaretCircleDown,
  faUser,
  faPhone,
  faEnvelope,
  faHashtag,
  faDollarSign,
  faEquals,
  faCalendarDay,
  faPercentage
} from "@fortawesome/pro-solid-svg-icons";

const ColumnTypes: GenericTable.ColumnType[] = [
  {
    id: "action"
  },
  {
    id: "text",
    icon: faFontCase,
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "longText",
    icon: faAlignLeft,
    style: { textAlign: "left" }
  },
  {
    id: "singleSelect",
    icon: faCaretCircleDown,
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } },
    editorIsPopup: true
  },
  {
    id: "contact",
    icon: faUser,
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "phone",
    icon: faPhone,
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "email",
    icon: faEnvelope,
    style: { textAlign: "left" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "number",
    icon: faHashtag,
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "currency",
    icon: faDollarSign,
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "sum",
    icon: faEquals,
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "date",
    icon: faCalendarDay,
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  },
  {
    id: "percentage",
    icon: faPercentage,
    style: { textAlign: "right" },
    headerOverrides: { style: { textAlign: "center" } }
  }
];

export default ColumnTypes;
