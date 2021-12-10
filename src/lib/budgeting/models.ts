import { isNil } from "lodash";
import { util, tabling } from "lib";
import { Colors } from "style/constants";

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export enum FringeUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export const FringeUnitModels: { [key: string]: Model.FringeUnit } = {
  PERCENT: { id: 0, name: FringeUnitNames.PERCENT },
  FLAT: { id: 1, name: FringeUnitNames.FLAT }
};

export const FringeUnits = Object.values(FringeUnitModels);

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export enum MarkupUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export const MarkupUnitModels: { [key: string]: Model.MarkupUnit } = {
  PERCENT: { id: 0, name: MarkupUnitNames.PERCENT },
  FLAT: { id: 1, name: MarkupUnitNames.FLAT }
};

export const MarkupUnits = Object.values(MarkupUnitModels);

export const getGroupColorDefinition = (
  group: Style.HexColor | Model.Group | Table.GroupRow<any>
): Table.RowColorDef => {
  if (!isNil(group)) {
    let color =
      typeof group === "string" ? group : tabling.typeguards.isRow(group) ? group.groupData.color : group.color;
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
