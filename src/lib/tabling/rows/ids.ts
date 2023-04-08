import { generateRandomNumericId } from "../../util";
import { GridIds } from "../types";

import * as typeguards from "./typeguards";
import * as types from "./types";

export const markupRowId = (r: number): types.MarkupRowId => `markup-${r}`;
export const markupId = (r: types.MarkupRowId): number => parseInt(r.split("markup-")[1]);

export const groupRowId = (r: number): types.GroupRowId => `group-${r}`;
export const groupId = (r: types.GroupRowId): number => parseInt(r.split("group-")[1]);

export const placeholderRowId = (): types.PlaceholderRowId =>
  `placeholder-${generateRandomNumericId()}`;

export const footerRowId = <T extends typeof GridIds.FOOTER | typeof GridIds.PAGE>(
  gridId: T,
): types.FooterRowId<T> => `footer-${gridId}`;

export const safeEditableRowId = (
  r: types.RowId<types.EditableRowType>,
): types.RowId<types.EditableRowType> => (typeguards.isMarkupRowId(r) ? r : parseInt(String(r)));

export const editableId = (r: types.RowId<types.EditableRowType>): number =>
  typeguards.isMarkupRowId(r) ? markupId(r) : parseInt(String(r));
