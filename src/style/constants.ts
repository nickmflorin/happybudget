import { reduce, flatten, map } from "lodash";

export const Breakpoints: Breakpoints = {
  small: 320,
  medium: 480,
  large: 768,
  xl: 1024,
  xxl: 1200,
  xxxl: 1580
};

export const DEFAULT_TAG_COLOR_SCHEME = [
  "#d5d5e5",
  "#ffd2ba",
  "#beebff",
  "#f8c5cf",
  "#ffeda0",
  "#c8c4ea",
  "#5ad198",
  "#5e5e5e",
  "#b49a85",
  "#886da8",
  "#76d0ca",
  "#58add6",
  "#ffd2ba",
  "#beebff"
];

export const Colors = {
  TEXT_PRIMARY: "rgba(0, 0, 0, 0.85)",
  TEXT_SECONDARY: "#424242",
  TABLE_BORDER: "#F7F7F7",
  DEFAULT_TAG_BACKGROUND: "#EFEFEF",
  DEFAULT_GROUP_ROW_BACKGROUND: "#EFEFEF",
  COLOR_NO_COLOR: "#585858"
};

export const TABLE_BORDER_RADIUS = 8;

/* eslint-disable no-unused-vars */
export const FontWeightMap: { [key in Style.FontWeightName]: Style.FontWeight } = {
  Bold: 700,
  Regular: 400,
  Light: 300,
  SemiBold: 600,
  Medium: 600
};

export const SupportedFontFaces: Style.FontFace[] = [
  {
    family: "Roboto",
    variants: [
      { weight: "Bold", hasItalic: true },
      { weight: "Medium", hasItalic: true },
      "Regular",
      { weight: "Light", hasItalic: true }
    ]
  },
  {
    family: "AvenirNext",
    variants: [
      { weight: "Bold", hasItalic: true },
      "Light",
      "Medium",
      { weight: "Regular", hasItalic: true },
      { weight: "SemiBold", hasItalic: true }
    ]
  }
];

export const fontToString = (font: Style.Font): string => {
  return `Font { family = ${font.family}, weight: ${font.weight}, italic: ${font.italic || false} }`;
};

export const getFontSourceModuleName = (font: Style.Font): string => {
  return font.italic === true ? `${font.family}_${font.weight}Italic` : `${font.family}_${font.weight}`;
};

export const getFontSourceFileName = (font: Style.Font, extension = "ttf"): string => {
  return font.italic === true
    ? `${font.family}-${font.weight}Italic.${extension}`
    : `${font.family}-${font.weight}.${extension}`;
};

export const getFontSourceFileDirectory = (font: Style.Font): string => {
  return font.italic === true ? `${font.family}/${font.weight}/Italic` : `${font.family}/${font.weight}`;
};

export const getFontSourceFile = (font: Style.Font, extension = "ttf"): string => {
  return `./fonts/${getFontSourceFileDirectory(font)}/${getFontSourceFileName(font, extension)}`;
};

export const fontsFromFontFace = (fontFace: Style.FontFace): Style.Font[] => {
  return reduce(
    fontFace.variants,
    (fonts: Style.Font[], variant: Style.FontVariant) => {
      fonts = [...fonts, { family: fontFace.family, weight: typeof variant === "string" ? variant : variant.weight }];
      if (typeof variant !== "string" && variant.hasItalic === true) {
        return [...fonts, { family: fontFace.family, weight: variant.weight, italic: true }];
      }
      return fonts;
    },
    []
  );
};

export const SupportedFonts: Style.Font[] = flatten(
  map(SupportedFontFaces, (fontFace: Style.FontFace) => fontsFromFontFace(fontFace))
);
