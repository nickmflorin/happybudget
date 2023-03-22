import * as tabling from "../../tabling";
import * as ui from "../../ui";

import * as types from "./types";

export const getGroupColorDefinition = <R extends tabling.Row>(
  group: ui.HexColor | types.Group | tabling.Row<R, "group">,
): tabling.RowColorDef => {
    const color =
      typeof group === "string"
        ? group
        : tabling.rows.isRow(group)
        ? group.groupData.color
        : group.color;
    if (!isNil(color)) {
      return {
        backgroundColor: color,
        color: util.colors.contrastedForegroundColor(color),
      };
    }
  return {
    backgroundColor: Colors.COLOR_NO_COLOR,
    color: util.colors.contrastedForegroundColor(Colors.COLOR_NO_COLOR),
  };
};
