/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Style {
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type HexColor = `#${number | string}`;

  type FontFamily = "AvenirNext" | "Roboto";
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type FontWeight = 300 | 400 | 500 | 600 | 700;
  type FontWeightName = "Bold" | "Regular" | "Light" | "SemiBold" | "Medium";

  type FontVariant = FontWeightName | { weight: FontWeightName, hasItalic?: boolean };
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Font = { family: FontFamily, weight: FontWeightName, italic?: boolean };
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type FontFace = { family: FontFamily; variants: FontVariant[] };

  type Breakpoint = 320 | 480 | 768 | 1024 | 1200 | 1580;
  type BreakpointId = "small" | "medium" | "large" | "xl" | "xxl" | "xxxl";
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Breakpoints = Record<BreakpointId, Breakpoint>;
}