import { constants } from "style";

import * as model from "../../model";
import * as ui from "../../ui";
import { colors } from "../../util";

import * as typeguards from "./typeguards";
import * as types from "./types";

export const getGroupColorDefinition = <R extends types.RowData>(
  group: ui.HexColor | model.Group | types.RowOfType<"group", R>,
): types.RowColorDef => {
  let color: ui.HexColor | null;
  if (typeof group === "string") {
    color = group;
  } else if (typeguards.isGroupRow(group)) {
    color = group.data.color;
  } else if (model.isGroup(group)) {
    color = group.color;
  } else {
    throw new Error(
      `Invalid value '${JSON.stringify(group)}' to function 'getGroupColorDefinition'.`,
    );
  }
  if (color !== null) {
    return {
      backgroundColor: color,
      color: colors.contrastedForegroundColor(color),
    };
  }
  return {
    backgroundColor: constants.colors.lightGrey,
    color: colors.contrastedForegroundColor(constants.colors.lightGrey),
  };
};
