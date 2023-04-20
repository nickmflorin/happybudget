import { useMediaQuery } from "react-responsive";

import { constants } from "style";

import * as types from "./types";

export const useLessThanBreakpoint = (id: types.BreakpointId): boolean =>
  useMediaQuery({ query: `(max-width: ${constants.Breakpoints[id]}px)` });
