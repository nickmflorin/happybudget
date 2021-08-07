/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Style {
  type FontFamily = "AvenirNext" | "Roboto";
  type FontWeight = 300 | 400 | 500 | 600 | 700;
  type FontWeightName = "Bold" | "Regular" | "Light" | "SemiBold" | "Medium";

  type FontVariant = FontWeightName | { weight: FontWeightName, hasItalic?: boolean };
  type Font = { family: FontFamily, weight: FontWeightName, italic?: boolean };
  type FontFace = { family: FontFamily; variants: FontVariant[] };
}