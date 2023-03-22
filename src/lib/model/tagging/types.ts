import * as ui from "../../ui";
import * as types from "../types";

export type Tag = types.ApiModel<{
  readonly title: string;
  readonly plural_title: string | null;
  readonly order: number;
  readonly color: ui.HexColor | null;
}>;

export const isTag = (model: types.Model | Tag): model is Tag =>
  (model as Tag).title !== undefined && (model as Tag).color !== undefined;
