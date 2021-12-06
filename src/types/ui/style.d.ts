declare namespace Style {

  type HexColor = `#${number | string}`;

  type FontFamily = "AvenirNext" | "Roboto";

  type FontWeight = 300 | 400 | 500 | 600 | 700;
  type FontWeightName = "Bold" | "Regular" | "Light" | "SemiBold" | "Medium";

  type FontVariant = FontWeightName | { weight: FontWeightName, hasItalic?: boolean };

  type Font = { family: FontFamily, weight: FontWeightName, italic?: boolean };

  type FontFace = { family: FontFamily; variants: FontVariant[] };

  type Breakpoint = 320 | 480 | 768 | 1024 | 1200 | 1580;
  type BreakpointId = "small" | "medium" | "large" | "xl" | "xxl" | "xxxl";

  type Breakpoints = Record<BreakpointId, Breakpoint>;
}
