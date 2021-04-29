export const MOMENT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const MOMENT_DATE_FORMAT = "YYYY-MM-DD";
export const MOMENT_API_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const MOMENT_API_DATE_FORMAT = "YYYY-MM-DD";
export const DATE_DISPLAY_FORMAT = "MM/DD/YYYY";
export const TIME_DISPLAY_FORMAT = "hh:mm A";
export const DATETIME_DISPLAY_FORMAT = "LLL";
export const DATETIME_ABBV_DISPLAY_FORMAT = "lll";

// Temporary flag - we don't want to remove all of this behavior that can
// denote an error in a table cell yet, but we don't want it to currently be
// active.
export const DISPLAY_ERRORS_IN_TABLE = false;

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

// Convenience flag for development to turn off the context menu so we can right-click inspect
// the cells and turn on debug mode for AG Grid.
export const TABLE_DEBUG = false;
export const TABLE_PINNING_ENABLED: boolean = false;
