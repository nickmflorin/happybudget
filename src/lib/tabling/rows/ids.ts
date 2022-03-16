import { util } from "lib";
import * as typeguards from "./typeguards";

export const markupRowId = (r: number): Table.MarkupRowId => `markup-${r}`;
export const markupId = (r: Table.MarkupRowId): number => parseInt(r.split("markup-")[1]);

export const groupRowId = (r: number): Table.GroupRowId => `group-${r}`;
export const groupId = (r: Table.GroupRowId): number => parseInt(r.split("group-")[1]);

export const placeholderRowId = (): Table.PlaceholderRowId => `placeholder-${util.generateRandomNumericId()}`;
export const footerRowId = (gridId: Table.FooterGridId): Table.FooterRowId => `footer-${gridId}`;

export const safeEditableRowId = (r: Table.EditableRowId): Table.EditableRowId =>
  typeguards.isMarkupRowId(r) ? r : parseInt(String(r));
export const editableId = (r: Table.EditableRowId): number =>
  typeguards.isMarkupRowId(r) ? markupId(r) : parseInt(String(r));
