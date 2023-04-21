/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { HexColorSchema } from "lib/ui/types/schemas";
/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { parseSize } from "lib/ui/util";

import scssBreakpoints from "./partials/variables/_breakpoints.module.scss";
import scssColors from "./partials/variables/_colors.module.scss";

export enum BreakpointIds {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  XLARGE = "xlarge",
  XXLARGE = "xxlarge",
  XXXLARGE = "xxxlarge",
}

export type BreakpointId = typeof BreakpointIds[keyof typeof BreakpointIds];

const AllBreakpointIds = Object.keys(BreakpointIds).map(
  (value: string) => BreakpointIds[value as keyof typeof BreakpointIds],
) as BreakpointId[];

const BreakpointIdToSCSSName: { [key in BreakpointId]: string } = {
  small: "smallBreakpoint",
  medium: "mediumBreakpoint",
  large: "largeBreakpoint",
  xlarge: "xLargeBreakpoint",
  xxlarge: "xxLargeBreakpoint",
  xxxlarge: "xxxLargeBreakpoint",
};

export type Breakpoints = Record<BreakpointId, number>;

const formBreakpoints = (): Breakpoints =>
  AllBreakpointIds.reduce((prev: Breakpoints, k: string) => {
    const breakpointId = k as BreakpointId;
    const breakpointValue = scssBreakpoints[BreakpointIdToSCSSName[breakpointId]];
    if (breakpointValue === undefined) {
      throw new Error(
        `Breakpoint '${breakpointId}' cannot be established: No SCSS variable found for '${BreakpointIdToSCSSName[breakpointId]}'`,
      );
    }
    const parsed = parseSize(breakpointValue, { strict: false });
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

export enum ColorNames {
  lightGrey = "lightGrey",
}

export type ColorName = typeof ColorNames[keyof typeof ColorNames];

const AllColorNames = Object.keys(ColorNames).map(
  (value: string) => ColorNames[value as keyof typeof ColorNames],
) as ColorName[];

export type Colors = { [key in ColorName]: import("lib/ui/types/style").HexColor };

const formColors = (): Colors =>
  AllColorNames.reduce((prev: Colors, k: ColorName) => {
    const hexColor = scssColors[k];

    if (hexColor === undefined) {
      throw new Error(`Color '${k}' cannot be established: No SCSS variable found for '${k}'`);
    }
    const parsed = HexColorSchema.safeParse(hexColor);
    if (parsed.success) {
      return { ...prev, [k]: parsed.data };
    }
    throw new Error(
      `Color '${k}' cannot be established: SCSS variable for ` +
        `'${k} has value '${hexColor} that is invalid'`,
    );
  }, {} as Colors);

export const colors = formColors();
