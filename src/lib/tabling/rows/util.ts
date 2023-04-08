import * as model from "../../model";
import * as ui from "../../ui";
import { colors } from "../../util";

import * as typeguards from "./typeguards";
import * as types from "./types";

export const getGroupColorDefinition = <R extends types.RowData>(
  group: ui.HexColor | model.Group | types.RowOfType<"group", R>,
): types.RowColorDef => {
  const color: ui.HexColor | undefined =
    typeof group === "string"
      ? group
      : typeguards.isRow(group)
      ? group.data.color
      : (group.color as ui.HexColor | undefined);
  if (color !== undefined) {
    return {
      backgroundColor: color,
      color: colors.contrastedForegroundColor(color),
    };
  }
  return {
    backgroundColor: Colors.COLOR_NO_COLOR,
    color: colors.contrastedForegroundColor(Colors.COLOR_NO_COLOR),
  };
};
