import { isNil } from "lodash";

import { Colors } from "style/constants";
import * as tabling from "../tabling";
import * as util from "../util";

export enum FringeUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export const FringeUnitModels: { [key in "PERCENT" | "FLAT"]: Model.FringeUnit } = {
  PERCENT: { id: 0, name: FringeUnitNames.PERCENT },
  FLAT: { id: 1, name: FringeUnitNames.FLAT }
};

export const FringeUnits = Object.values(FringeUnitModels);

export enum MarkupUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export const MarkupUnitModels: { [key: string]: Model.MarkupUnit } = {
  PERCENT: { id: 0, name: MarkupUnitNames.PERCENT },
  FLAT: { id: 1, name: MarkupUnitNames.FLAT }
};

export const MarkupUnits = Object.values(MarkupUnitModels);

export const getGroupColorDefinition = <R extends Table.RowData>(
  group: Style.HexColor | Model.Group | Table.GroupRow<R>
): Table.RowColorDef => {
  if (!isNil(group)) {
    const color = typeof group === "string" ? group : tabling.rows.isRow(group) ? group.groupData.color : group.color;
    if (!isNil(color)) {
      return {
        backgroundColor: color,
        color: util.colors.contrastedForegroundColor(color)
      };
    }
  }
  return {
    backgroundColor: Colors.COLOR_NO_COLOR,
    color: util.colors.contrastedForegroundColor(Colors.COLOR_NO_COLOR)
  };
};
