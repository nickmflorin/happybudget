export const UUID_PATH_PARAM_REGEX_STRING = "([0-9a-zA-z-]+)";
export const PATH_END_REGEX_STRING = "(?:\\/)?(\\?([^\\/]+)?(\\/)?)?$";

export const MACHINE_PATH_REGEX = new RegExp(
  `^/machines/${UUID_PATH_PARAM_REGEX_STRING}${PATH_END_REGEX_STRING}`,
);

export const MACHINES_PATH_REGEX = new RegExp(`^/machines${PATH_END_REGEX_STRING}`);
