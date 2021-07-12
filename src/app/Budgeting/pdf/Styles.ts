import ReactPDF from "@react-pdf/renderer";
import { StyleSheet, Font } from "@react-pdf/renderer";
import { Style } from "@react-pdf/types";
import { forEach, isNil, map } from "lodash";

const TABLE_BORDER_COLOR = "#F7F7F7";
const TABLE_BORDER_RADIUS = 8;

type FontVariant = "Bold" | "Regular" | "Light" | "SemiBold";
type PdfFont = { family: string; variants: FontVariant[] };

const FontVariantMap = {
  Bold: 700,
  Regular: 400,
  Light: 300,
  SemiBold: 600
};

export const PdfFonts: PdfFont[] = [
  {
    family: "OpenSans",
    variants: ["Regular", "Light", "SemiBold", "Bold"]
  }
];

export const registerFont = (font: PdfFont): void => {
  Font.register({
    family: font.family,
    fonts: map(font.variants, (variant: FontVariant) => ({
      src: process.env.PUBLIC_URL + `/fonts/${font.family}-${variant}.ttf`,
      fontWeight: FontVariantMap[variant]
    }))
  });
};

export const registerFonts = () => {
  map(PdfFonts, (font: PdfFont) => registerFont(font));
};

// TODO: We might have to fork @react-pdf so that display: table works,
// because theirs disallows it.
// TODO: Eventually, we want to figure out a way to load our SCSS files and
// pull constants from there.
const Styles: ReactPDF.Styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "white",
    padding: 25
  },
  "page-header": {},
  "page-header-title": {
    fontFamily: "OpenSans",
    color: "#404152",
    fontWeight: 700,
    fontSize: 24
  },
  "page-header-subtitle": {
    fontFamily: "OpenSans",
    color: "#000000",
    fontWeight: 600,
    fontSize: 14
  },
  "page-content": {
    flexGrow: 100
  },
  "page-footer": {},
  "page-footer-page-no-text": {
    fontFamily: "OpenSans",
    color: "#000000",
    fontWeight: 600,
    fontSize: 14
  },
  table: {
    // Note: react-pdf does not "support" display: table, even though it works fine,
    // their TS bindings disallow it.
    /* @ts-ignore */
    display: "table",
    width: "auto",
    backgroundColor: "white",
    fontFamily: "OpenSans"
  },
  tr: {
    flexDirection: "row",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: TABLE_BORDER_COLOR
  },
  "body-tr": { height: "22pt", backgroundColor: "white" },
  "header-tr": {
    height: "24pt",
    backgroundColor: TABLE_BORDER_COLOR,
    borderTopLeftRadius: TABLE_BORDER_RADIUS,
    borderTopRightRadius: TABLE_BORDER_RADIUS,
    border: "none"
  },
  "group-tr": {
    borderLeftWidth: 0,
    borderRightWidth: 0
  },
  "footer-tr": {
    height: "24pt",
    backgroundColor: TABLE_BORDER_COLOR,
    borderBottomRightRadius: TABLE_BORDER_RADIUS,
    borderBottomLeftRadius: TABLE_BORDER_RADIUS,
    border: "none"
  },
  "account-header-tr": {
    backgroundColor: "#EAEAEA"
  },
  "account-sub-header-tr": {
    height: "24pt",
    backgroundColor: TABLE_BORDER_COLOR,
    border: "none"
  },
  th: {
    paddingLeft: 4,
    paddingRight: 4,
    border: "none"
  },
  td: {
    paddingLeft: 4,
    paddingRight: 4,
    // The default border is none, since we set the border for each side to 0
    // here.  However, on an individual cell basis, we turn on specific borders
    // by overriding the specific side width.
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderColor: TABLE_BORDER_COLOR
  },
  "no-border": {
    border: "none !important"
  },
  "indent-td": {
    paddingLeft: 18
  },
  "cell-text": { margin: "auto", width: "100%" },
  "th-text": { marginTop: 6, fontSize: 8, color: "#595959", fontWeight: 700 },
  "td-text": { marginTop: 5, fontSize: 9, color: "#1F1F1F", fontWeight: 600 },
  tag: { height: 14, paddingLeft: 2, paddingRight: 2, paddingTop: 1, paddingBottom: 1, borderRadius: 20, marginTop: 5 },
  "tag-text": {
    fontSize: 8,
    fontWeight: 400,
    textAlign: "center"
  },
  uppercase: { textTransform: "uppercase" },
  "fill-width": { textAlign: "center", width: "100%" },
  "group-tr-td-text": { textTransform: "uppercase", color: "#595959", fontWeight: 700 },
  "footer-tr-td-text": { color: "#595959", fontWeight: 700, marginTop: 6 },
  "detail-tr-td-text": { fontWeight: 300, color: "#000000" },
  "account-sub-header-tr-td-text": { color: "#595959", fontWeight: 700 },
  "subaccount-tr-td-text": {},
  "subaccount-footer-tr-td-text": {}
});

export const mergeStylesFromClassName = (className: string | undefined): Style => {
  let mergedStyle: Style = {};
  if (isNil(className)) {
    return mergedStyle;
  }
  const split = className.split(" ");
  forEach(split, (csName: string) => {
    const classStyles: Style | undefined = Styles[csName.trim()];
    if (!isNil(classStyles)) {
      mergedStyle = { ...mergedStyle, ...classStyles };
    }
  });
  return mergedStyle;
};

export default Styles;
