import { ui, enumeratedLiterals, EnumeratedLiteralType } from "lib";

import scssBreakpoints from "./partials/variables/_breakpoints.module.scss";
import scssColors from "./partials/variables/_colors.module.scss";

export const BreakpointIds = enumeratedLiterals([
  "small",
  "medium",
  "large",
  "xLarge",
  "xxLarge",
  "xxxLarge",
] as const);
export type BreakpointId = EnumeratedLiteralType<typeof BreakpointIds>;

const BreakpointIdToSCSSName = {
  small: "smallBreakpoint",
  medium: "mediumBreakpoint",
  large: "largeBreakpoint",
  xLarge: "xLargeBreakpoint",
  xxLarge: "xxLargeBreakpoint",
  xxxLarge: "xxxLargeBreakpoint",
};

export type Breakpoints = Record<BreakpointId, number>;

const formBreakpoints = (): Breakpoints =>
  BreakpointIds.__ALL__.reduce((prev: Breakpoints, k: string) => {
    const breakpointId = k as BreakpointId;
    const breakpointValue = scssBreakpoints[BreakpointIdToSCSSName[breakpointId]];
    if (breakpointValue === undefined) {
      throw new Error(
        `Breakpoint '${breakpointId}' cannot be established: No SCSS variable found for '${BreakpointIdToSCSSName[breakpointId]}'`,
      );
    }
    const parsed = ui.parseSize(breakpointValue, { strict: false });
    if (typeof parsed === "number") {
      throw new Error(
        `Breakpoint '${breakpointId}' cannot be established: SCSS variable for ` +
          `'${BreakpointIdToSCSSName[breakpointId]} has value '${breakpointValue} that does not ` +
          "have a valid size unit.'",
      );
    } else if (parsed === null) {
      throw new Error(
        `Breakpoint '${breakpointId}' cannot be established: SCSS variable for ` +
          `'${BreakpointIdToSCSSName[breakpointId]} has value '${breakpointValue} that is invalid'`,
      );
    } else if (parsed[1] !== "px") {
      throw new Error(
        `Breakpoint '${breakpointId}' cannot be established: SCSS variable for ` +
          `'${BreakpointIdToSCSSName[breakpointId]} has value '${breakpointValue} with invalid units.'`,
      );
    }
    return { ...prev, [breakpointId]: parsed[0] };
  }, {} as Breakpoints);

export const breakpoints = formBreakpoints();

export const ColorNames = enumeratedLiterals(["lightGrey"] as const);
export type ColorName = EnumeratedLiteralType<typeof ColorNames>;

export type Colors = { [key in ColorName]: ui.HexColor };

const formColors = (): Colors =>
  ColorNames.__ALL__.reduce((prev: Colors, k: string) => {
    const colorName = k as ColorName;
    const hexColor = scssColors[colorName];

    if (hexColor === undefined) {
      throw new Error(
        `Color '${colorName}' cannot be established: No SCSS variable found for '${colorName}'`,
      );
    }
    const parsed = ui.HexColorSchema.safeParse(hexColor);
    if (parsed.success) {
      return { ...prev, [colorName]: parsed.data };
    }
    throw new Error(
      `Color '${colorName}' cannot be established: SCSS variable for ` +
        `'${colorName} has value '${hexColor} that is invalid'`,
    );
  }, {} as Colors);

export const colors = formColors();
