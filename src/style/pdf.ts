import ReactPDF from "@react-pdf/renderer";
import { StyleSheet, Font } from "@react-pdf/renderer";
import { Style } from "@react-pdf/types";
import { forEach, isNil, map } from "lodash";

import { Colors, TABLE_BORDER_RADIUS } from "./constants";

type FontVariant = "Bold" | "Regular" | "Light" | "SemiBold" | "Medium";
type PdfFont = { family: string; variants: FontVariant[] };

const FontVariantMap = {
  Bold: 700,
  Regular: 400,
  Light: 300,
  SemiBold: 600,
  Medium: 600
};

export const PdfFonts: PdfFont[] = [
  {
    family: "OpenSans",
    variants: ["Regular", "Light", "SemiBold", "Bold"]
  },
  {
    family: "Roboto",
    variants: ["Regular", "Light", "Medium", "Bold"]
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

const StyleMixins: ReactPDF.Styles = StyleSheet.create({
  header: {
    fontFamily: "OpenSans"
  }
});

// TODO: It would be nice to reference constants from SCSS files.
const Styles: ReactPDF.Styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "white",
    padding: 25
  },
  "page-header": {
    marginBottom: 20
  },
  "budget-page-header": {},
  "budget-page-primary-header": {},
  "budget-page-sub-header": {
    display: "flex",
    minHeight: 70,
    marginTop: 20,
    flexDirection: "row"
  },
  "budget-page-sub-header-left": {
    width: "50%",
    display: "flex",
    flexDirection: "row"
  },
  "budget-page-sub-header-right": {
    width: "50%",
    display: "flex",
    flexDirection: "row"
  },
  "budget-page-sub-header-image": {
    width: 70,
    height: 70,
    objectFit: "contain",
    marginRight: 15,
    borderRadius: 10
  },
  "budget-page-sub-header-rich-text": {
    flexGrow: 100
  },
  "page-content": {
    flexGrow: 100
  },
  // Used to display a blank page when the PDF has no valid pages to render.
  "page-no-data-content": {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    height: "100%"
  },
  "page-no-data-text": {
    textAlign: "center",
    fontFamily: "OpenSans",
    color: "#404152",
    fontWeight: 700,
    fontSize: 20
  },
  "page-footer": {
    marginTop: 15
  },
  notes: {},
  "notes-container": {
    border: `1px solid ${Colors.TABLE_BORDER}`,
    borderRadius: 10,
    padding: 15,
    minHeight: "50pt"
  },
  "notes-text": {},
  "page-number": {
    fontSize: 10,
    textAlign: "right",
    width: "100%",
    marginTop: 4
  },
  paragraph: {
    fontFamily: "Roboto",
    fontSize: 11,
    color: Colors.TEXT_PRIMARY,
    lineHeight: "1.5pt"
  },
  label: {
    fontFamily: "OpenSans",
    fontSize: 12,
    fontWeight: 600,
    color: Colors.TEXT_PRIMARY,
    lineHeight: "1.5pt",
    marginBottom: 4
  },
  bold: { fontWeight: 700 },
  italic: { fontStyle: "italic" },
  h1: {
    ...StyleMixins.header,
    fontWeight: 700,
    fontSize: 24,
    color: Colors.TEXT_SECONDARY
  },
  h2: {
    ...StyleMixins.header,
    fontWeight: 700,
    fontSize: 20,
    color: Colors.TEXT_SECONDARY
  },
  h3: {
    ...StyleMixins.header,
    fontWeight: 600,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY
  },
  h4: {
    ...StyleMixins.header,
    fontWeight: 600,
    fontSize: 14,
    color: Colors.TEXT_PRIMARY
  },
  h5: {
    ...StyleMixins.header,
    fontWeight: 400,
    fontSize: 12,
    color: Colors.TEXT_PRIMARY
  },
  h6: {
    ...StyleMixins.header,
    fontWeight: 400,
    fontSize: 10,
    color: Colors.TEXT_PRIMARY
  },
  table: {
    // Note: react-pdf does not "support" display: table, even though it works fine,
    // their TS bindings disallow it.
    /* @ts-ignore */
    display: "table",
    width: "auto",
    backgroundColor: "white",
    fontFamily: "Roboto"
  },
  tr: {
    flexDirection: "row",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: Colors.TABLE_BORDER
  },
  "body-tr": { height: "20pt", backgroundColor: "white" },
  "header-tr": {
    height: "22pt",
    backgroundColor: Colors.TABLE_BORDER,
    borderTopLeftRadius: TABLE_BORDER_RADIUS,
    borderTopRightRadius: TABLE_BORDER_RADIUS,
    border: "none"
  },
  "group-tr": {
    borderLeftWidth: 0,
    borderRightWidth: 0
  },
  "subaccount-tr": {},
  "detail-tr": {},
  "subaccount-footer-tr": {},
  "detail-group-tr": {},
  "footer-tr": {
    height: "22pt",
    backgroundColor: Colors.TABLE_BORDER,
    borderBottomRightRadius: TABLE_BORDER_RADIUS,
    borderBottomLeftRadius: TABLE_BORDER_RADIUS,
    border: "none"
  },
  "account-header-tr": {
    backgroundColor: "#EAEAEA"
  },
  "account-sub-header-tr": {
    height: "22pt",
    backgroundColor: Colors.TABLE_BORDER,
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
    borderColor: Colors.TABLE_BORDER
  },
  "td-border-right": {
    borderRightWidth: 1
  },
  "td-border-left": {
    borderLeftWidth: 1
  },
  "group-tr-td": {
    borderLeftWidth: 0,
    borderRightWidth: 0,
    border: "none !important",
    borderColor: "none"
  },
  indented: {
    backgroundColor: "white",
    // This here is an absolute hack.  The problem is that because we are applying
    // a background color to the entire GroupRow, but overriding the indented cells
    // with a background color "white", we still see remnants of the GroupRow backgroundColor
    // as a thin line at the top of the indented cell.  To fix this, we essentially
    // "cover" it here, by giving it a white top border and moving the cell up slightly.
    borderTopWidth: 3,
    borderTopColor: "white",
    marginTop: -2
  },
  "indent-td": {
    paddingLeft: 18
  },
  "detail-td": {},
  "subaccount-td": {},
  "subaccount-footer-td": {},
  "detail-group-indent-td": {
    paddingLeft: 14
  },
  "cell-text": { margin: "auto", width: "100%" },
  "th-text": { marginTop: 6, fontSize: 8, color: "#595959", fontWeight: 700 },
  "td-text": { marginTop: 4, fontSize: 9, color: "#1F1F1F", fontWeight: 600 },
  tag: { height: 14, paddingLeft: 2, paddingRight: 2, paddingTop: 1, paddingBottom: 1, borderRadius: 20, marginTop: 2 },
  "tag--contact": { borderRadius: 6 },
  "tag-text": {
    fontSize: 8,
    fontWeight: 400,
    textAlign: "center",
    marginTop: 1
  },
  uppercase: { textTransform: "uppercase" },
  "fill-width": { textAlign: "center", width: "100%" },
  "group-tr-td-text": { color: "#595959", fontWeight: 700 },
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
    } else {
      /* eslint-disable no-console */
      console.warn(`Unrecognized class name ${csName}`);
    }
  });
  return mergedStyle;
};

export default Styles;
