import { Font, StyleSheet } from "@react-pdf/renderer";
import { forEach, isNil, map, reduce, filter } from "lodash";
import {
  SupportedFontFaces,
  FontWeightMap,
  Colors,
  TABLE_BORDER_RADIUS,
  fontsFromFontFace,
  fontToString,
  getFontSourceModuleName
} from "./constants";

export const importFontModules = (): Promise<{ [key: string]: any }> => import("./fonts");

export const getPdfFont = (font: Style.Font, modules: { [key: string]: any }): Pdf.Font | null => {
  const moduleName = getFontSourceModuleName(font);
  if (isNil(modules[moduleName])) {
    console.warn(`Module ${moduleName} is not on fonts path for ${fontToString(font)}.  It will not be registered.`);
    return null;
  } else if (font.italic === true) {
    return {
      src: modules[moduleName],
      fontWeight: FontWeightMap[font.weight],
      fontStyle: "italic"
    };
  } else {
    return {
      src: modules[moduleName],
      fontWeight: FontWeightMap[font.weight]
    };
  }
};

export const registerFontFace = (fontFace: Style.FontFace, modules: { [key: string]: any }) => {
  const fontFaceFonts: Style.Font[] = fontsFromFontFace(fontFace);
  const pdfFonts = map(fontFaceFonts, (font: Style.Font) => getPdfFont(font, modules));
  Font.register({
    family: fontFace.family,
    fonts: filter(pdfFonts, (font: Pdf.Font | null) => !isNil(font)) as Pdf.Font[]
  });
};

export const registerFonts = (): Promise<void> => {
  return importFontModules().then((modules: { [key: string]: any }) => {
    map(SupportedFontFaces, (fontFace: Style.FontFace) => registerFontFace(fontFace, modules));
  });
};

// TODO: It would be nice to reference constants from SCSS files.
const TextStyles: Pdf.ExtensionStyles = {
  text: { color: Colors.TEXT_SECONDARY },
  bold: { fontWeight: 700 },
  italic: { fontStyle: "italic" },
  uppercase: { textTransform: "uppercase" },
  header: { ext: ["text"], fontFamily: "AvenirNext" },
  paragraph: { ext: ["text"], fontFamily: "AvenirNext", fontSize: 9, lineHeight: "1.5pt" },
  h1: {
    ext: ["header"],
    fontWeight: 700,
    fontSize: 20,
    lineHeight: "1.5pt",
    marginBottom: 2
  },
  h2: {
    ext: ["header"],
    fontWeight: 700,
    fontSize: 18,
    lineHeight: "1.5pt",
    marginBottom: 2
  },
  h3: {
    ext: ["header"],
    fontWeight: 600,
    fontSize: 18,
    lineHeight: "1.5pt",
    marginBottom: 2
  },
  h4: {
    ext: ["header"],
    fontWeight: 600,
    fontSize: 16,
    lineHeight: "1.5pt",
    marginBottom: 2
  },
  h5: {
    ext: ["header"],
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "1.5pt",
    marginBottom: 2
  },
  h6: {
    ext: ["header"],
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "1.5pt",
    marginBottom: 2
  },
  label: {
    fontFamily: "AvenirNext",
    fontSize: 12,
    fontWeight: 600,
    lineHeight: "1.5pt",
    marginBottom: 4
  }
};

const LayoutStyles: Pdf.ExtensionStyles = {
  page: {
    flexDirection: "column",
    backgroundColor: "white",
    padding: 25
  },
  "page-header": {
    marginBottom: 20
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
    fontFamily: "AvenirNext",
    color: "#404152",
    fontWeight: 700,
    fontSize: 20
  },
  "page-footer": {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15
  },
  "page-number": {
    fontSize: 10,
    marginTop: 4
  }
};

const TableStyles: Pdf.ExtensionStyles = {
  table: {
    /* Note: react-pdf does not "support" display: table, even though it works
			 fine, their TS bindings disallow it. */
    /* @ts-ignore */
    display: "table",
    width: "auto",
    backgroundColor: "white",
    fontFamily: "AvenirNext"
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
  "th-first-child": {
    paddingLeft: 8
  },
  "th-last-child": {
    paddingRight: 8
  },
  td: {
    paddingLeft: 4,
    paddingRight: 4,
    /* The default border is none, since we set the border for each side to 0
       here.  However, on an individual cell basis, we turn on specific borders
       by overriding the specific side width. */
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderColor: Colors.TABLE_BORDER
  },
  "td-first-child": {
    paddingLeft: 8
  },
  "td-last-child": {
    paddingRight: 8
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
    /* This here is an absolute hack.  The problem is that because we are applying
       a background color to the entire GroupRow, but overriding the indented
			 cells with a background color "white", we still see remnants of the
			 GroupRow backgroundColor as a thin line at the top of the indented cell.

			 To fix this, we essentially "cover" it here, by giving it a white top
			 border and moving the cell up slightly. */
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
  "cell-text": { width: "100%" },
  "th-text": { marginTop: 6, fontSize: 8, color: "#595959", fontWeight: 700 },
  "td-text": { marginTop: 4, fontSize: 9, color: "#1F1F1F", fontWeight: 600 },
  tag: {
    height: 14,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    borderRadius: 20,
    marginTop: 2
  },
  "tag--contact": { borderRadius: 4 },
  "tag--account": {
    fontWeight: 500,
    borderWidth: 0.5,
    borderColor: Colors.TEXT_SECONDARY,
    borderRadius: 3
  },
  "tag-text": {
    fontSize: 8,
    fontWeight: 400,
    textAlign: "center",
    marginTop: 0.5
  },
  "fill-width": { textAlign: "center", width: "100%" },
  "group-tr-td-text": { color: "#595959", fontWeight: 700 },
  "footer-tr-td-text": { color: "#595959", fontWeight: 700, marginTop: 6 },
  "detail-tr-td-text": { fontWeight: 300, color: "#000000" },
  "account-sub-header-tr-td-text": { color: "#595959", fontWeight: 700, marginTop: 6 },
  "subaccount-tr-td-text": {},
  "subaccount-footer-tr-td-text": {}
};

const ExportStyles: Pdf.ExtensionStyles = {
  "page-header": {
    marginBottom: 10
  },
  "page-primary-header": {},
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
  "footer-logo": {
    width: 100,
    height: 30,
    objectFit: "contain"
  },
  "budget-page-sub-header-rich-text": {
    flexGrow: 100
  },
  notes: {},
  "notes-container": {
    border: `1px solid ${Colors.TABLE_BORDER}`,
    borderRadius: 10,
    padding: 15,
    minHeight: "50pt"
  },
  "notes-text": {}
};

const Styles: Pdf.ExtensionStyles = { ...TextStyles, ...LayoutStyles, ...ExportStyles, ...TableStyles };

export const styleForClassName = (className: string): Pdf.Style => {
  let style: Pdf.ExtensionStyle = {};
  if (isNil(Styles[className.trim()])) {
    console.warn(`Unrecognized class name ${className}`);
    return style;
  }
  style = Styles[className.trim()];
  if (!isNil(style.ext)) {
    let { ext, ...coreStyle } = style;
    const extensions = Array.isArray(ext) ? ext : [ext];
    coreStyle = !isNil(coreStyle) ? coreStyle : {};
    return reduce(
      extensions,
      (currentStyle: Pdf.Style, extension: string) => {
        return { ...styleForClassName(extension), ...currentStyle };
      },
      coreStyle
    );
  }
  return style;
};

export const mergeStylesFromClassName = (className: string | undefined): Pdf.Style => {
  let mergedStyle: Pdf.Style = {};
  if (isNil(className)) {
    return mergedStyle;
  }
  const split = className.split(" ");
  forEach(split, (csName: string) => {
    mergedStyle = { ...mergedStyle, ...styleForClassName(csName) };
  });
  return mergedStyle;
};

export const createStyleSheet = (styles: Pdf.ExtensionStyles): Pdf.Styles => {
  const newStyles: Pdf.Styles = {};
  forEach(styles, (value: Pdf.Style, className: string) => {
    newStyles[className] = styleForClassName(className);
  });
  return StyleSheet.create(newStyles);
};

export default createStyleSheet(Styles);
