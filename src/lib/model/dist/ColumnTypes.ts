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

const ColumnTypes: Table.ColumnType[] = [
  {
    id: "text",
    icon: faFontCase,
    align: "left"
  },
  {
    id: "longText",
    icon: faAlignLeft,
    align: "left"
  },
  {
    id: "singleSelect",
    icon: faCaretCircleDown,
    align: "left",
    editorIsPopup: true
  },
  {
    id: "contact",
    icon: faUser,
    align: "left"
  },
  {
    id: "phone",
    icon: faPhone,
    align: "left"
  },
  {
    id: "email",
    icon: faEnvelope,
    align: "left"
  },
  {
    id: "number",
    icon: faHashtag,
    align: "right"
  },
  {
    id: "currency",
    icon: faDollarSign,
    align: "right"
  },
  {
    id: "sum",
    icon: faEquals,
    align: "right"
  },
  {
    id: "date",
    icon: faCalendarDay,
    align: "right"
  },
  {
    id: "percentage",
    icon: faPercentage,
    align: "right"
  }
];

export default ColumnTypes;
