import { flatten } from "lodash";

import { ui } from "lib";

export const DEFAULT_COLOR_SCHEME: ui.HexColor[] = [
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
  "#beebff",
];

export const Colors: { [key: string]: ui.HexColor } = {
  TEXT_PRIMARY: "#404152",
  TEXT_SECONDARY: "#424242",
  TABLE_BORDER: "#F7F7F7",
  COLOR_NO_COLOR: "#EFEFEF",
  GREEN: "#0fb767",
};

export const TABLE_BORDER_RADIUS = 8;

export const FontWeightMap: { [key in ui.FontWeightName]: ui.FontWeight } = {
  Bold: 700,
  Regular: 400,
  Light: 300,
  SemiBold: 600,
  Medium: 600,
};

export const SupportedFontFaces: ui.FontFace[] = [
  {
    family: "Roboto",
    variants: [
      { weight: "Bold", hasItalic: true },
      { weight: "Medium", hasItalic: true },
      "Regular",
      { weight: "Light", hasItalic: true },
    ],
  },
  {
    family: "AvenirNext",
    variants: [
      { weight: "Bold", hasItalic: true },
      "Light",
      "Medium",
      { weight: "Regular", hasItalic: true },
      { weight: "SemiBold", hasItalic: true },
    ],
  },
];

export const fontToString = (font: ui.Font): string =>
  `Font { family = ${font.family}, weight: ${font.weight}, italic: ${String(
    font.italic || false,
  )} }`;

export const getFontSourceModuleName = (font: ui.Font): string =>
  font.italic === true ? `${font.family}_${font.weight}Italic` : `${font.family}_${font.weight}`;

export const getFontSourceFileName = (font: ui.Font, extension = "ttf"): string =>
  font.italic === true
    ? `${font.family}-${font.weight}Italic.${extension}`
    : `${font.family}-${font.weight}.${extension}`;

export const getFontSourceFileDirectory = (font: ui.Font): string =>
  font.italic === true ? `${font.family}/${font.weight}/Italic` : `${font.family}/${font.weight}`;

export const getFontSourceFile = (font: ui.Font, extension = "ttf"): string =>
  `./fonts/${getFontSourceFileDirectory(font)}/${getFontSourceFileName(font, extension)}`;

export const fontsFromFontFace = (fontFace: ui.FontFace): ui.Font[] =>
  fontFace.variants.reduce((fonts: ui.Font[], variant: ui.FontVariant) => {
    fonts = [
      ...fonts,
      { family: fontFace.family, weight: typeof variant === "string" ? variant : variant.weight },
    ];
    if (typeof variant !== "string" && variant.hasItalic === true) {
      return [...fonts, { family: fontFace.family, weight: variant.weight, italic: true }];
    }
    return fonts;
  }, []);

export const SupportedFonts: ui.Font[] = flatten(
  SupportedFontFaces.map((fontFace: ui.FontFace) => fontsFromFontFace(fontFace)),
);
