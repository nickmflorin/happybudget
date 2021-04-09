export const MOMENT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const MOMENT_DATE_FORMAT = "YYYY-MM-DD";
export const MOMENT_API_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const MOMENT_API_DATE_FORMAT = "YYYY-MM-DD";
export const DATE_DISPLAY_FORMAT = "YYYY-MM-DD";
export const TIME_DISPLAY_FORMAT = "hh:mm A";
export const DATETIME_DISPLAY_FORMAT = "LLL";
export const DATETIME_ABBV_DISPLAY_FORMAT = "lll";
export const DEFAULT_TZ = "America/Toronto";

// Temporary flag - we don't want to remove all of this behavior that can
// denote an error in a table cell yet, but we don't want it to currently be
// active.
export const DISPLAY_ERRORS_IN_TABLE = false;

export const DEFAULT_TAG_COLOR_SCHEME = [
  "#797695",
  "#ff7165",
  "#80cbc4",
  "#ce93d8",
  "#fed835",
  "#c87987",
  "#69f0ae",
  "#a1887f",
  "#81d4fa",
  "#f75776",
  "#66bb6a",
  "#58add6"
];

// Convenience flag for development to turn off the context menu so we can right-click inspect
// the cells and turn on debug mode for AG Grid.
export const TABLE_DEBUG = false;
