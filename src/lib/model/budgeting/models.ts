import { isNil } from "lodash";
import { Colors } from "style/constants";

import { tabling, util } from "lib";
import * as choice from "../choice";

export enum FringeUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export enum FringeUnitSlugs {
  PERCENT = "percent",
  FLAT = "flat"
}

export const FringeUnits = choice.Choices([
  choice.Choice(0, FringeUnitNames.PERCENT, FringeUnitSlugs.PERCENT),
  choice.Choice(1, FringeUnitNames.FLAT, FringeUnitSlugs.FLAT)
]);

export enum MarkupUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export enum MarkupUnitSlugs {
  PERCENT = "percent",
  FLAT = "flat"
}

export const MarkupUnits = choice.Choices([
  choice.Choice(0, MarkupUnitNames.PERCENT, MarkupUnitSlugs.PERCENT),
  choice.Choice(1, MarkupUnitNames.FLAT, MarkupUnitSlugs.FLAT)
]);

export enum CollaboratorAccessTypeNames {
  VIEWONLY = "View Only",
  OWNER = "Owner",
  EDITOR = "Editor"
}

export enum CollaboratorAccessTypeSlugs {
  VIEWONLY = "view_only",
  OWNER = "owner",
  EDITOR = "editor"
}

export const CollaboratorAccessTypes = choice.Choices([
  choice.Choice(0, CollaboratorAccessTypeNames.VIEWONLY, CollaboratorAccessTypeSlugs.VIEWONLY),
  choice.Choice(1, CollaboratorAccessTypeNames.EDITOR, CollaboratorAccessTypeSlugs.EDITOR),
  choice.Choice(2, CollaboratorAccessTypeNames.OWNER, CollaboratorAccessTypeSlugs.OWNER)
]);

export enum ActualImportSourceNames {
  BANKACCOUNT = "Bank Account"
}

export enum ActualImportSourceSlugs {
  BANKACCOUNT = "bank_account"
}

export const ActualImportSources = choice.Choices([
  choice.Choice(0, ActualImportSourceNames.BANKACCOUNT, ActualImportSourceSlugs.BANKACCOUNT)
]);

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
